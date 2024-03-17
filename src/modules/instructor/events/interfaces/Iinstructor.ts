export interface registerBody {
    degree: string
    institution: string
    subject: string
    yearOfCompletion: string
    certificateName: string
    date: string
    buffer: Buffer | undefined;
    fieldName: string | undefined;
    mimeType: string | undefined;
  }