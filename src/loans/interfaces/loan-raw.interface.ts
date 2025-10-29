export interface LoanRaw{
    loan_id: number;
    loan_amount: number;
    loan_status: string;
    approved_by_id: number | null;
    approved_by_fullname: string | null;
    client_id: number | null;
    client_fullname: string | null;
    client_email: string | null;
    client_document_number: number | null;
}