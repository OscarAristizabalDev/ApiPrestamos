import { Client } from "../entities/clients.entity";

export class ClientMapper{
    static toDto(client: Client) {
        return {
          id: client.id,
          names: client.names,
          surnames: client.surnames,
          email: client.email,
          document_number: client.document_number
        };
      }
}

export class RowFoundClientMapper{
    static toDto(client: Client) {
        return {
          id: client.id,
          names: client.names,
          surnames: client.surnames,
          email: client.email,
          phone_number: client.phone_number,
          address: client.address,
          birthdate: client.birthdate,
          type_document_id: client.type_document_id,
          document_number: client.document_number
        };
      }
}
