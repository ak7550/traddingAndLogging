export class AngelAPIResponse<Type>{
    private status: string;
    private message: string;
    private errorcode: string;
    private data: Type;

    /**
     * Getter $status
     * @return {string}
     */
	public get $status(): string {
		return this.status;
	}

    /**
     * Getter $message
     * @return {string}
     */
	public get $message(): string {
		return this.message;
	}

    /**
     * Getter $errorcode
     * @return {string}
     */
	public get $errorcode(): string {
		return this.errorcode;
	}

    /**
     * Getter $data
     * @return {Type}
     */
	public get $data(): Type {
		return this.data;
	}

    /**
     * Setter $status
     * @param {string} value
     */
	public set $status(value: string) {
		this.status = value;
	}

    /**
     * Setter $message
     * @param {string} value
     */
	public set $message(value: string) {
		this.message = value;
	}

    /**
     * Setter $errorcode
     * @param {string} value
     */
	public set $errorcode(value: string) {
		this.errorcode = value;
	}

    /**
     * Setter $data
     * @param {Type} value
     */
	public set $data(value: Type) {
		this.data = value;
	}

    

}