import { plainToInstance } from "class-transformer";
import { LoanRaw } from "../interfaces/loan-raw.interface";
import { LoanResponseDto } from "../dto/create-loan.dto";

export class LoanMapper {
    static toDto(loan: any) {
      return {
        id: loan.id,
        amount: Number(loan.amount),
        currency: loan.currency,
        status: loan.status,
        start_date: loan.start_date,
        end_date: loan.end_date,
        created_at: loan.created_at,
        approved_by_id: loan.approvedBy ?? null,
        client_id: loan.client ? loan.client.id : null,
      };
    }
}

export class LoanMapperRaw {
  static rawToDto(raw: LoanRaw): LoanResponseDto {
    return plainToInstance(LoanResponseDto, {
      id: raw.loan_id,
      amount: Number(raw.loan_amount),
      status: raw.loan_status,
      approved_by: raw.approved_by_id ? 
                  {
                    id: raw.approved_by_id,
                    fullName: raw.approved_by_fullname
                  } : null,
      client: raw.client_id ? 
                  {
                    id: raw.client_id,
                    fullName: raw.client_fullname,
                    email: raw.client_email,
                    document_number: raw.client_document_number,
                  } : null
    });
  }

  static rawToDtoList(rows: LoanRaw[]): LoanResponseDto[]{
    return rows.map((raw)=> this.rawToDto(raw)); 
  }
}