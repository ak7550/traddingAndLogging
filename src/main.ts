import { HttpException, ValidationPipe, VersioningType } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.useGlobalPipes( new ValidationPipe( {
        transform: true
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
    SwaggerModule.setup("api", app, document);
    await app.listen(3000, () => console.log(`app is running on port 3000`));
}
bootstrap();
