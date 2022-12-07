import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { ConfirmDto } from 'src/payment_clean/types';
import { PaymentModule } from 'src/payment/payment.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [PaymentModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/api/payment/confirm (POST)', () => {
    const confirmDto: ConfirmDto = {
      TID: ''.padStart(30, 'x'),
      AuthToken: ''.padStart(40, 'x'),
      MID: ''.padStart(10, 'x'),
      Amt: 99000,
      EdiDate: '202202042100',
      productName: 'product'
    }

    return request(app.getHttpServer())
      .post('/api/payment/confirm')
      .send(confirmDto)
      .expect(201)
  });

  it('/api/payment/refund (POST)', () => {

  })
});
