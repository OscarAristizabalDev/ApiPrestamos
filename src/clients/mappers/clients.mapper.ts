import { FoundClientDto } from "../dtos/clients.dto";
import { Client, ClientDocument } from "../schemas/client.schema";
export class ClientMapper{
    static toDto(client: ClientDocument) {
        return {
          id: client._id,
          names: client.names,
          surnames: client.surnames,
          fullName: client.fullName,
          email: client.email,
          documentNumber: client.documentNumber
        };
      }
}

export class RowFoundClientMapper{
    static toDto(client: ClientDocument): FoundClientDto {
        return {
          id: client._id,
          names: client.names,
          surnames: client.surnames,
          fullName: client.fullName,
          email: client.email,
          phoneNumber: client.phoneNumber,
          address: client.address,
          birthdate: client.birthdate.toISOString(),
          typeDocument: client.typeDocument.toString(),
          documentNumber: client.documentNumber,
          employmentStatus: client.employmentStatus,
          employerName: client.employerName,
          monthlyIncome: client.monthlyIncome,
          creditScore: client.creditScore,
          riskCategory: client.riskCategory,
          notes: client.notes,
        };
      }
}
