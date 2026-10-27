import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ConfigModule } from '@nestjs/config';
import { TodosModule } from './modules/todos/todos.module.js';

@Module({
  imports: [    
    ConfigModule.forRoot({ isGlobal: true }),
    TodosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
