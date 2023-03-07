import { readFileSync, writeFile } from "node:fs"

export class Database {
    private data: any = {}

    constructor(private file: string) {
        this.data = JSON.parse(readFileSync(file).toString())
    }

    set(key: string | number, value: any) {
        writeFile(this.file, JSON.stringify(this.data, null, 2), () => {

        })
        return this.data[key] = value
    }

    get(key: string | number) {
        return this.data[key]
    }
}