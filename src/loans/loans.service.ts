import { ConflictException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { LoanMapperRaw } from "./mappers/loans.mapper";
import { CreateLoanDto } from "./dto/create-loan.dto";

@Injectable()
export class LoansService{

    private readonly defaultLimit: number;

    constructor(
        private readonly config: ConfigService,
        private readonly loanRepository: Repository<any>,
        private readonly clientRepository: Repository<any>,
    ){
        this.defaultLimit = +this.config.get<number>('PAGINATION_LIMIT', 10);
    }
    
    async getLoansPaginated(page: number, limit?: number){
        const take = limit ?? this.defaultLimit;
        const skip = (page - 1) * take;

        const qb = this.loanRepository
        .createQueryBuilder('loans')
        .leftJoin('loans.approvedBy','approved_by')
        .leftJoin('loans.client','client')
        .select([
            'loans.id AS loan_id',
            'loans.amount AS loan_amount',
            'loans.status AS loan_status',
            'approved_by.id AS approved_by_id',
            "CONCAT(approved_by.names, ' ', approved_by.surnames) AS approved_by_fullname",
            'client.id AS client_id',
            "CONCAT(client.names, ' ', client.surnames) AS client_fullname",
            'client.email AS client_email',
            'client.document_number AS client_document_number',
        ])
        .where('loans.status = :status', { status: 'APPROVED' })
        .andWhere('client.email LIKE :email', { email: '%gmail.com' })
        .orderBy('loans.created_at', 'DESC')
        .skip(skip)
        .take(take);

        const [rows, total] = await Promise.all([
            qb.getRawMany(),
            this.loanRepository.count(),
        ]);

        return{
            data: LoanMapperRaw.rawToDtoList(rows),
            total,
            page,
            limit: take,
            totalPages: Math.ceil(total/take)
        }
    }

    async createLoan(loan: CreateLoanDto){
        const clientExist = await this.clientRepository.findOne({where: {id: loan.client_id}});

        if(!clientExist){
            throw new ConflictException('El Cliente no existe');
        }

        return this.loanRepository.save(loan);
    }
}