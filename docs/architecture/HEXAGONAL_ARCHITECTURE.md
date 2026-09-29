# Hexagonal Architecture — Reference Framework

Reference guide for building new modules (or extending existing ones) with the hexagonal (ports & adapters) style used in `src/quotes` and `src/loans`.

> Scope: apply this only to modules that are already hexagonal (`quotes`, `loans`) or to **new** modules. Flat-layer modules (`auth`, `users`, `clients`, `products`, `messages`, `requests`) keep their existing pattern. Never mix both styles inside one module.

---

## 1. Layers and the dependency rule

```
          ┌──────────────────────────────────────────────┐
          │ infrastructure (adapters)                    │
          │  http/controllers · http/dto · http/mappers  │
          │  persistence/mongo (repository, schemas,     │
          │  persistence mappers)                        │
          └───────────────┬──────────────────────────────┘
                          │ depends on
          ┌───────────────▼──────────────────────────────┐
          │ application                                  │
          │  commands · ports/incoming · ports/outgoing  │
          │  services (use case implementations)         │
          └───────────────┬──────────────────────────────┘
                          │ depends on
          ┌───────────────▼──────────────────────────────┐
          │ domain                                       │
          │  entities · enums · strategies               │
          └──────────────────────────────────────────────┘
```

Dependencies point **inward only**:

| Layer            | May import                                   | Must NOT import                                        |
|------------------|----------------------------------------------|--------------------------------------------------------|
| `domain`         | other `domain` code (own or shared kernel)   | `@nestjs/*`, `mongoose`, `class-validator`, DTOs, application, infrastructure |
| `application`    | `domain`, own `commands`/`ports`, `@nestjs/common` DI decorators (`Injectable`, `Inject`) | `infrastructure`, Mongoose models/schemas, HTTP DTOs |
| `infrastructure` | `application` ports/commands, `domain`, frameworks | other modules' `infrastructure` or schemas             |

---

## 2. Folder structure

```
src/<module>/
├── <module>.module.ts                     # Composition root: binds tokens to implementations
├── domain/
│   ├── entities/<name>.entity.ts           # Plain classes, no decorators
│   ├── enums/<name>.enum.ts
│   └── strategies/<concern>/               # Optional: interchangeable domain algorithms
│       ├── <concern>-strategy.interface.ts
│       └── <variant>-<concern>.strategy.ts
├── application/
│   ├── commands/<action>-<entity>.command.ts
│   ├── ports/
│   │   ├── incoming/
│   │   │   ├── tokens.ts                   # Use case DI tokens
│   │   │   └── <action>-<entity>.use-case.ts
│   │   └── outgoing/                       # Only when the module talks to the outside world
│   │       ├── tokens.ts                   # Adapter DI tokens
│   │       └── <entity>-repository.port.ts
│   └── services/
│       ├── <action>-<entity>.service.ts    # Implements a use case
│       └── <concern>/                      # Optional: strategy resolvers / helpers
└── infrastructure/
    ├── http/
    │   ├── controllers/<entity>.controller.ts
    │   ├── dto/<action>-<entity>.request.dto.ts
    │   ├── dto/<entity>-response.dto.ts
    │   └── mappers/<entity>-http.mapper.ts
    └── persistence/
        └── mongo/
            ├── <entity>.repository.ts      # Implements the outgoing port
            ├── schemas/<entity>.schema.ts
            ├── schemas/<other>-lookup.schema.ts   # Read-only projections of foreign collections
            └── mappers/<entity>-persistence.mapper.ts
```

`ports/outgoing` and `infrastructure/persistence` exist only when needed: `quotes` is pure calculation and has neither; `loans` persists to Mongo and has both.

---

## 3. Request flow

```
HTTP request
  → Controller                     (infrastructure/http)
      validates via Request DTO (global ValidationPipe)
      HttpMapper.toXxxCommand(dto, authUser)
  → UseCase (injected by token)    (application/ports/incoming)
      Service.execute(command)     (application/services)
        → domain entities / strategies
        → RepositoryPort (injected by token)   (application/ports/outgoing)
            → Repository adapter   (infrastructure/persistence)
                PersistenceMapper.toDoc(command) / toDomain(document)
      ← domain entity
  ← HttpMapper.toResponse(entity) → Response DTO
HTTP response
```

Each boundary has its own data shape and its own mapper:

| Boundary                  | Input shape       | Output shape      | Mapper                          |
|---------------------------|-------------------|-------------------|---------------------------------|
| HTTP → application        | Request DTO       | Command           | `<Entity>HttpMapper.toXxxCommand` |
| application → HTTP        | Domain entity     | Response DTO      | `<Entity>HttpMapper.toResponse`   |
| application → persistence | Command / filter  | Mongo document    | `<Entity>PersistenceMapper.toCreateDoc` |
| persistence → application | Mongo document    | Domain entity     | `<Entity>PersistenceMapper.toDomain` |

---

## 4. Building blocks (templates)

Examples use a hypothetical `payments` module. Replace names as needed.

### 4.1 Domain entity — `domain/entities/payment.entity.ts`

Plain TypeScript. No Nest, Mongoose or validation decorators. IDs are `string`, never `ObjectId`.

```ts
import { PaymentStatus } from '../enums/payment-status.enum';

export class Payment {
    id: string;
    loanId: string;
    amount: number;
    paidAt: Date;
    status: PaymentStatus;
    createdAt?: Date;
}
```

### 4.2 Domain enum — `domain/enums/payment-status.enum.ts`

```ts
export enum PaymentStatus {
    PENDING = 'pending',
    APPLIED = 'applied',
}
```

Enums are reused by DTOs (`@IsEnum`) and schemas (`@Prop({ enum })`), which is allowed because those layers are outer layers.

### 4.3 Domain strategy (optional) — `domain/strategies/<concern>/`

Use when a business rule has interchangeable variants selected by an enum (see `quotes/domain/strategies/amortization` and `expiration`).

```ts
// <concern>-strategy.interface.ts
export interface PaymentAllocationStrategy {
    allocate(amount: number, pendingQuotes: number): number[];
}

// proportional-payment-allocation.strategy.ts
export class ProportionalPaymentAllocation implements PaymentAllocationStrategy {
    allocate(amount: number, pendingQuotes: number): number[] {
        return Array.from({ length: pendingQuotes }, () => amount / pendingQuotes);
    }
}
```

Keep strategies synchronous unless they really do I/O. They are registered as plain providers in the module so the resolver can receive them by DI.

### 4.4 Strategy resolver — `application/services/<concern>/<concern>-strategy.resolver.ts`

Maps an enum value to a strategy instance. Lives in `application`, not `domain`, because it participates in DI.

```ts
@Injectable()
export class PaymentAllocationStrategyResolver {
    constructor(
        private readonly proportional: ProportionalPaymentAllocation,
        private readonly oldestFirst: OldestFirstPaymentAllocation,
    ) {}

    resolve(mode: PaymentAllocationMode): PaymentAllocationStrategy {
        switch (mode) {
            case PaymentAllocationMode.PROPORTIONAL:
                return this.proportional;
            case PaymentAllocationMode.OLDEST_FIRST:
                return this.oldestFirst;
            default:
                throw new Error('Unsupported payment allocation mode');
        }
    }
}
```

Adding a variant = new strategy class + new enum value + new `case` + register provider.

### 4.5 Command — `application/commands/register-payment.command.ts`

Immutable input to a use case. Constructor with `public readonly` params; required first, optional (with defaults) last. Contains only primitives, enums and domain types — never DTOs.

```ts
export class RegisterPaymentCommand {
    constructor(
        public readonly loanId: string,
        public readonly amount: number,
        public readonly registeredBy: string,
        public readonly paidAt: string,
        public readonly note: string | null = null,
    ) {}
}
```

Actor data (user id, role) is passed into the command by the HTTP mapper, never read from the request inside the service (see `LoanHttpMapper.toCreateCommand(dto, user.id)` and `toMetricsCommand(dto, user.role)`).

### 4.6 Incoming port — `application/ports/incoming/`

One interface per use case plus a string token.

```ts
// tokens.ts
export const REGISTER_PAYMENT_USE_CASE = 'REGISTER_PAYMENT_USE_CASE';
export const LIST_PAYMENTS_USE_CASE = 'LIST_PAYMENTS_USE_CASE';

// register-payment.use-case.ts
export interface RegisterPaymentUseCase {
    register(command: RegisterPaymentCommand): Promise<Payment>;
}
```

### 4.7 Outgoing port — `application/ports/outgoing/`

Describes what the application needs from the outside world, in domain terms. Read-model types that are not entities (pagination, metrics, filters) are declared here too.

```ts
// tokens.ts
export const PAYMENT_REPOSITORY = 'PAYMENT_REPOSITORY';

// payment-repository.port.ts
export interface PaginatedPayments {
    data: Payment[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface PaymentRepositoryPort {
    create(command: RegisterPaymentCommand): Promise<Payment>;
    findPaginated(page: number, limit: number): Promise<PaginatedPayments>;
    loanExists(loanId: string): Promise<boolean>;
}
```

Existence checks for foreign aggregates (`clientExists`, `productExists` in `loans`) belong to this port so the module does not import another module's service.

### 4.8 Application service — `application/services/register-payment.service.ts`

Implements the incoming port, depends only on outgoing ports (by token) and domain code. Orchestrates validation of business invariants and delegates persistence.

```ts
@Injectable()
export class RegisterPaymentService implements RegisterPaymentUseCase {
    constructor(
        @Inject(PAYMENT_REPOSITORY)
        private readonly paymentRepository: PaymentRepositoryPort,
    ) {}

    async register(command: RegisterPaymentCommand): Promise<Payment> {
        const loanExists = await this.paymentRepository.loanExists(command.loanId);

        if (!loanExists) {
            throw new ConflictException('Loan does not exist');
        }

        return this.paymentRepository.create(command);
    }
}
```

Business-level constants (e.g. which role sees extra detail) live in the service, not the controller — see `ADVISOR_DETAIL_ROLE` in `get-loan-metrics.service.ts`.

### 4.9 Request / response DTOs — `infrastructure/http/dto/`

- Request DTOs: `class-validator` decorators on **every** field (global `ValidationPipe` uses `whitelist` + `forbidNonWhitelisted`). All fields `readonly` and explicitly typed.
- Nested objects: `@ValidateNested()` + `@Type(() => NestedDto)`.
- Query DTOs (`list-<entity>.request.dto.ts`) use `@Type(() => Number)` for numeric query params.
- Response DTOs: dates as ISO `string`, plain JSON shape, no domain classes.

```ts
export class RegisterPaymentRequestDto {
    @IsMongoId()
    readonly loanId: string;

    @IsNumber({ maxDecimalPlaces: 2 })
    @IsPositive()
    readonly amount: number;

    @IsDateString()
    readonly paidAt: string;

    @IsOptional()
    @IsString()
    readonly note?: string;
}
```

### 4.10 HTTP mapper — `infrastructure/http/mappers/payment-http.mapper.ts`

Static, stateless. `toXxxCommand` for inputs, `toResponse` / `toPaginatedResponse` for outputs. Converts `Date` ↔ ISO strings here.

```ts
export class PaymentHttpMapper {
    static toRegisterCommand(dto: RegisterPaymentRequestDto, registeredBy: string): RegisterPaymentCommand {
        return new RegisterPaymentCommand(dto.loanId, dto.amount, registeredBy, dto.paidAt, dto.note ?? null);
    }

    static toResponse(payment: Payment): PaymentResponseDto {
        return {
            id: payment.id,
            loanId: payment.loanId,
            amount: payment.amount,
            paidAt: payment.paidAt.toISOString(),
            status: payment.status,
        };
    }
}
```

### 4.11 Controller — `infrastructure/http/controllers/payment.controller.ts`

Thin: DTO → mapper → use case → mapper. Injects use cases **by token and interface**, never the concrete service. Guards at class level for protected modules.

```ts
@ApiTags('Payments')
@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentController {
    constructor(
        @Inject(REGISTER_PAYMENT_USE_CASE)
        private readonly registerPaymentUseCase: RegisterPaymentUseCase,
    ) {}

    @Post()
    async register(@Body() body: RegisterPaymentRequestDto, @AuthUser() user: CurrentUserDto) {
        const command = PaymentHttpMapper.toRegisterCommand(body, user.id);
        const payment = await this.registerPaymentUseCase.register(command);
        return PaymentHttpMapper.toResponse(payment);
    }
}
```

No business logic, no repository access, no Mongoose types in controllers.

### 4.12 Mongo schema — `infrastructure/persistence/mongo/schemas/`

- Class suffix `SchemaClass` (`LoanSchemaClass`) to avoid clashing with the domain entity name.
- Export `<Entity>Document = <Entity>SchemaClass & Document` and `<Entity>Schema = SchemaFactory.createForClass(...)`.
- Embedded sub-documents: `@Schema({ _id: false })`.
- **Lookup schemas** (`client-lookup.schema.ts`, `product-lookup.schema.ts`): minimal read-only projections of another module's collection (`@Schema({ collection: 'clients' })`), so this module never imports the other module's schema or service.

### 4.13 Persistence mapper — `infrastructure/persistence/mongo/mappers/payment-persistence.mapper.ts`

The only place where `ObjectId` ↔ `string` conversion happens. No `any`: declare a local interface for the document shape to write, and for populated references.

```ts
interface CreatePaymentDoc {
    loan: Types.ObjectId;
    amount: number;
    paidAt: Date;
    registeredBy: Types.ObjectId;
    note: string | null;
}

export class PaymentPersistenceMapper {
    static toCreateDoc(command: RegisterPaymentCommand): CreatePaymentDoc {
        return {
            loan: new Types.ObjectId(command.loanId),
            amount: command.amount,
            paidAt: new Date(command.paidAt),
            registeredBy: new Types.ObjectId(command.registeredBy),
            note: command.note,
        };
    }

    static toDomain(doc: PaymentDocument): Payment {
        return {
            id: doc._id.toString(),
            loanId: doc.loan.toString(),
            amount: doc.amount,
            paidAt: doc.paidAt,
            status: doc.status,
            createdAt: doc.createdAt,
        };
    }
}
```

For populated refs, model the union explicitly (`PopulatedParty | Types.ObjectId | null`) and branch with `instanceof Types.ObjectId`, as in `LoanPersistenceMapper.toParty`.

### 4.14 Repository adapter — `infrastructure/persistence/mongo/payment.repository.ts`

Implements the outgoing port. Injects Mongoose models, uses the persistence mapper, always returns domain entities or port-defined read models.

```ts
@Injectable()
export class PaymentRepository implements PaymentRepositoryPort {
    constructor(
        @InjectModel(PaymentSchemaClass.name)
        private readonly paymentModel: Model<PaymentDocument>,
        @InjectModel(LoanLookupSchemaClass.name)
        private readonly loanModel: Model<LoanLookupDocument>,
    ) {}

    async create(command: RegisterPaymentCommand): Promise<Payment> {
        const created = await this.paymentModel.create(PaymentPersistenceMapper.toCreateDoc(command));
        return PaymentPersistenceMapper.toDomain(created);
    }

    async loanExists(loanId: string): Promise<boolean> {
        if (!Types.ObjectId.isValid(loanId)) return false;
        return (await this.loanModel.exists({ _id: loanId })) !== null;
    }
}
```

Heavy reads (aggregations) stay in the repository: raw aggregation result shapes are declared as local `Raw*` interfaces and normalized before leaving the adapter (see `LoanRepository.getMetrics`).

### 4.15 Module — `<module>.module.ts` (composition root)

The only place that knows which concrete class fulfils each port.

```ts
@Module({
    imports: [
        MongooseModule.forFeature([
            { name: PaymentSchemaClass.name, schema: PaymentSchema },
            { name: LoanLookupSchemaClass.name, schema: LoanLookupSchema },
        ]),
    ],
    controllers: [PaymentController],
    providers: [
        // Outgoing port adapters
        { provide: PAYMENT_REPOSITORY, useClass: PaymentRepository },

        // Application use cases
        { provide: REGISTER_PAYMENT_USE_CASE, useClass: RegisterPaymentService },
        { provide: LIST_PAYMENTS_USE_CASE, useClass: ListPaymentsService },

        // Domain strategies / resolvers (only if used)
    ],
    exports: [REGISTER_PAYMENT_USE_CASE, LIST_PAYMENTS_USE_CASE],
})
export class PaymentsModule {}
```

Export **tokens**, not classes. Remember to import the module in `src/app.module.ts`.

---

## 5. Naming conventions

| Artifact               | File                                         | Class / symbol                     |
|------------------------|----------------------------------------------|------------------------------------|
| Entity                 | `<entity>.entity.ts`                         | `Payment`                          |
| Enum                   | `<entity>-<name>.enum.ts`                    | `PaymentStatus`                    |
| Strategy interface     | `<concern>-strategy.interface.ts`            | `PaymentAllocationStrategy`        |
| Strategy               | `<variant>-<concern>.strategy.ts`            | `ProportionalPaymentAllocation`    |
| Command                | `<action>-<entity>.command.ts`               | `RegisterPaymentCommand`           |
| Incoming port          | `<action>-<entity>.use-case.ts`              | `RegisterPaymentUseCase`           |
| Incoming token         | `ports/incoming/tokens.ts`                   | `REGISTER_PAYMENT_USE_CASE`        |
| Outgoing port          | `<entity>-repository.port.ts`                | `PaymentRepositoryPort`            |
| Outgoing token         | `ports/outgoing/tokens.ts`                   | `PAYMENT_REPOSITORY`               |
| Service                | `<action>-<entity>.service.ts`               | `RegisterPaymentService`           |
| Resolver               | `<concern>-strategy.resolver.ts`             | `PaymentAllocationStrategyResolver`|
| Request DTO            | `<action>-<entity>.request.dto.ts`           | `RegisterPaymentRequestDto`        |
| Response DTO           | `<entity>-response.dto.ts`                   | `PaymentResponseDto`               |
| HTTP mapper            | `<entity>-http.mapper.ts`                    | `PaymentHttpMapper`                |
| Controller             | `<entity>.controller.ts`                     | `PaymentController`                |
| Schema                 | `<entity>.schema.ts`                         | `PaymentSchemaClass`, `PaymentSchema`, `PaymentDocument` |
| Lookup schema          | `<foreign>-lookup.schema.ts`                 | `LoanLookupSchemaClass`            |
| Persistence mapper     | `<entity>-persistence.mapper.ts`             | `PaymentPersistenceMapper`         |
| Repository adapter     | `<entity>.repository.ts`                     | `PaymentRepository`                |

Files are kebab-case; one exported concept per file.

---

## 6. Cross-module rules

- **Shared kernel:** a module may import another module's `domain` enums/entities when they model the same concept (`loans` reuses `QuoteFrequency`, `QuoteAmortization` and `Quote` from `quotes/domain`). Only `domain` may be shared this way.
- **Behaviour across modules:** consume the other module's exported **use case token**, never its service class or repository.
- **Data across modules:** use a local lookup schema + a method on your own outgoing port (`clientExists`), not the other module's Mongoose model.
- **Snapshots:** when historical accuracy matters, store an immutable copy of the foreign data (`customerSnapshot`, `productSnapshot`) alongside the reference id.
- **Auth:** reuse `JwtAuthGuard`, `RolesGuard`, `@Roles`, `@AuthUser` and `src/auth/ownership.ts`; do not re-implement role logic inside the module.

---

## 7. Checklist for a new use case

1. [ ] Domain: add/extend entity, enum or strategy (no framework imports).
2. [ ] `application/commands/<action>-<entity>.command.ts`.
3. [ ] `application/ports/incoming/<action>-<entity>.use-case.ts` + token in `tokens.ts`.
4. [ ] If new I/O is needed: extend the outgoing port interface (+ token if it is a new adapter).
5. [ ] `application/services/<action>-<entity>.service.ts` implementing the use case, injecting ports by token.
6. [ ] Request/response DTOs with full `class-validator` coverage.
7. [ ] HTTP mapper methods (`toXxxCommand`, `toResponse`).
8. [ ] Controller endpoint injecting the use case by token; guards/roles set.
9. [ ] Adapter implementation + persistence mapper updates (no `any`).
10. [ ] Bind token → class in `<module>.module.ts`; export the token if other modules need it.
11. [ ] `pnpm run build` and `pnpm run lint` pass.

---

## 8. Known deviations in current code (do not replicate)

These exist in `quotes`/`loans` today; new code should follow the rules above instead.

| Where | Deviation | Preferred approach |
|-------|-----------|--------------------|
| `loans/application/services/create-loan.service.ts` | Throws `ConflictException` (HTTP concept) from the application layer. | Acceptable pragmatically; if stricter isolation is wanted, throw a domain error and translate it in the controller or an exception filter. |
| `loans/application/ports/outgoing/loan-repository.port.ts` | `create()` receives the application `CreateLoanCommand`. | Fine within one module; prefer a dedicated input type if the port is shared or the command grows HTTP-specific fields. |
| `quotes/quotes.module.ts` | `CalculateQuoteService` registered twice (by token and by class) and with `Scope.REQUEST`. | Register once by token; use default singleton scope unless request state is actually needed. |
| `quotes/domain/strategies/**` | Pure calculations declared `async` and returning `await {...}`. | Keep domain computations synchronous. |
| `quotes/domain/entities/amortization.entity.ts` | Lowercase type name `amortization`. | PascalCase (`Amortization`). |
| `quotes/domain/strategies/expiration/weekly-quotestrategy.ts` | Missing hyphen in file name. | `weekly-quote.strategy.ts`. |
| `quotes/infrastructure/http/dto/calculate-quote.request.dto.ts` | `frequency` and `amortization` have no type annotation. | Always type DTO fields (`readonly frequency: QuoteFrequency`). |
| `quotes/application/services/calculate-quote.service.ts` | Commented-out legacy code. | Remove dead code. |
