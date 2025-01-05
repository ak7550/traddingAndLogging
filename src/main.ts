import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { CustomLogger } from "./custom-logger.service";
import moment from "moment-timezone";
import { NestExpressApplication } from "@nestjs/platform-express";

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>( AppModule, {
        bufferLogs: true
    } );

    moment.tz.setDefault("Asia/Kolkata"); // setting the default time zone with GMT+5:30
    app.useGlobalPipes( new ValidationPipe( {
        transform: true,
        disableErrorMessages: process.env.NODE_ENV === 'prod',
        // whitelist: true,
        // forbidNonWhitelisted: true,
        // forbidUnknownValues: true
    }))
        .enableVersioning();

    const config = new DocumentBuilder()
        .setTitle("Api Examples")
        .setDescription(
            "This includes all the trading and logging apis that are made by Aniket!!!",
        )
        .setVersion("1.0")
        .addTag("Trading")
        .addTag("Logging")
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup( "api", app, document );
    const port = process.env.PORT || 80;
    app.useLogger( new CustomLogger('NestApplication') );
    await app.listen(port, () => console.log(`app is running on port ${port}`));
}
bootstrap();
