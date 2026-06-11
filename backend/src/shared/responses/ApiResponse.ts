export class ApiResponse<T> {
    public readonly statusCode: number;
    public readonly data: T;
    public readonly message: string;
    public readonly success: boolean;
    public readonly meta?: unknown;

    constructor(
        statusCode: number,
        data: T,
        message: string = "Success",
        meta?: unknown
    ) {
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
        this.success = statusCode < 400;

        if(meta !== undefined){
            this.meta = meta;
        }
    }
}