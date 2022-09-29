import express, { request, response } from "express";
import cors from 'cors';
import { PrismaClient } from "@prisma/client";
import convertHourStringToMinutes from './utils/convert-hour-string-to-minutes';
import convertMinutesToHourString from "./utils/convert-minutes-to-hour-string";

const app = express();

app.use(express.json());

app.use(cors());

const prisma = new PrismaClient({
    log: ['query']
}) // Conexão com o banco 

// HTTP methods / API Restful / HTTP Codes -> Resposta de sucesso, erro e etc

/* GET -> Buscando , POST- Criação , PUT- Editando vários campos,
 Patch-> Editar informação especifica, Delete-> Remover informações */

/*
* Query: ... ex: (localhost:3333/ads?page=2&sort=title)
*Route: ... ex: (localhost:3333/post/como-criar-uma-api-no-node)
*Body: ... (enviar várias informações: geralmente formulários) : fica escondido.
*/

// --exit-child quando usar prisma 

app.get('/games', async (request, response) => {
    const games = await prisma.game.findMany({
        include: {
            _count: {
                select: {
                    ads: true
                }
            }
        }
    })


    return response.json(games);
});

app.post('/games/:id/ads', async (request, response) => {
    const gameId = request.params.id
    const body: any = request.body;

    // fazer validação

    const ad = await prisma.ad.create({
        data: {
            gameId,
            name: body.name,
            yearsPlaying: body.yearsPlaying,
            discord: body.discord,
            weekDays: body.weekDays.join(','),
            hoursStart: convertHourStringToMinutes(body.hoursStart),
            hourEnd: convertHourStringToMinutes(body.hourEnd),
            useVoiceChannel: body.useVoiceChannel,
        }
    })

    /* {
      "name": "Joao Paulo",
      "yearsPlaying": 2,
      "discord": "joao2510",
      "weekDays": [0, 5, 6],
      "hoursStart": "13:00",
      "hourEnd": "17:00",
      "useVoiceChannel": true
  }
  */

    return response.status(201).json(ad);
});

app.get("/games/:id/ads", async (request, response) => {
    const gameId = request.params.id;

    const ads = await prisma.ad.findMany({
        select: {
            id: true,
            name: true,
            hoursStart: true,
            hourEnd: true,
            weekDays: true,
            yearsPlaying: true,
            useVoiceChannel: true
        },
        where: {
            gameId,
        },
        orderBy: {
            createdAt: 'desc'
        }
    })

    return response.json(ads.map(ad => {
        return {
            ...ad,
            weekDays: ad.weekDays.split(','),
            hoursStart: convertMinutesToHourString(ad.hoursStart),
            hourEnd: convertMinutesToHourString(ad.hourEnd)
        }

    }))
});

app.get("/ads/:id/discord", async (request, response) => {
    const adId = request.params.id

    const ad = await prisma.ad.findUniqueOrThrow({
        select: {
            discord: true,
        },
        where: {
            id: adId,
        }
    })

    return response.json({
        discord: ad.discord,
    })
});

app.listen(3333);
