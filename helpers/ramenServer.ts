import http from 'http';
import { StringDecoder } from 'string_decoder'
import { RAMEN_ID } from '../data/impVar.json';
import { processVote } from './ramenVote';


export default () => {
    const httpServer = http.createServer((req, res) => mainServer(req, res));
    const PORT = process.env.PORT;

    function mainServer(req:http.IncomingMessage, res:http.ServerResponse) {
        // console.log('here');
        if (req.method == 'POST') {
            const decoder = new StringDecoder('utf-8');
            let buffer = '';
            req.on('data', data => {
                buffer += decoder.write(data);
            });
            req.on('end', () => {
                buffer += decoder.end();
                console.log(JSON.parse(buffer));
                if (JSON.parse(buffer).bot != RAMEN_ID) return;
                processVote(JSON.parse(buffer));
            });
            res.end('ok');
        }
    }

    httpServer.listen(PORT, () => {
        console.log(`listening on ${PORT}*`);
    });
}