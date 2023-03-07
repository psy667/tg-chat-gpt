import axios from 'axios';
import qs from 'querystring';

export class DeepL {
    constructor(token: string) {

    }

    translate(text: string, source: string, target: string) {
        

        const API_URL = 'https://api.deepl.com/v2/translate';

        const textToTranslate = 'Hello, how are you today?';
        const targetLang = 'DE';
        const deepApiKey = '<YOUR_DEEPL_API_KEY>';

        axios({
        url: API_URL,
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        data: qs.stringify({
            auth_key: deepApiKey,
            text: textToTranslate,
            target_lang: targetLang,
        }),
        })
        .then(response => {
        console.log(response.data.translations[0].text);
        })
        .catch(error => {
        console.error(error);
        });


    }
}