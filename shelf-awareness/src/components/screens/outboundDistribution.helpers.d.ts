export type FulfillmentUiState = {
  status: "fulfilled" | "partially_fulfilled";
  toastTitle: string;
  toastDescription: string;
};

export declare function triggerPdfDownload(input: {
  blob: BlobPart;
  filename: string;
  documentRef: Document;
  urlRef: Pick<typeof URL, "createObjectURL" | "revokeObjectURL">;
  blobFactory?: typeof Blob;
}): {
  filename: string;
  objectUrl: string;
};

export declare function getFulfillmentUiState(fulfillment?: {
  status?: string;
  qty_backordered_total?: number | string | null;
}): FulfillmentUiState;
