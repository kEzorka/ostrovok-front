import { Router } from 'express';
import { dateTimestamp } from '../../src/domain/dates';
import { parseSearchParams } from '../../src/domain/searchParams';
import type { TransferQuery, TransferSearchResponse } from '../../src/domain/types';
import { transfers } from '../fixtures/transfers';
import { requestParams } from './search';

export const transferRoutes = Router();
transferRoutes.get('/transfers', (request, response) => {
  const params = requestParams(request);
  const passengers = Number(params.get('passengers'));
  const date = params.get('date') ?? '';
  const time = params.get('time') ?? '';
  const returnDate = params.get('returnDate') ?? '';
  const query: TransferQuery = {
    from: params.get('from')?.trim().slice(0, 200) || 'Шереметьево',
    to: params.get('to')?.trim().slice(0, 200) || 'Москва',
    date: dateTimestamp(date) !== null ? date : parseSearchParams(new URLSearchParams()).checkIn,
    time: /^([01]\d|2[0-3]):[0-5]\d$/.test(time) ? time : '12:00',
    passengers: Number.isInteger(passengers) && passengers >= 1 && passengers <= 16 ? passengers : 2,
  };
  if (dateTimestamp(returnDate) !== null && returnDate >= query.date) query.returnDate = returnDate;
  const results = transfers.filter(option => option.passengers >= query.passengers);
  const body: TransferSearchResponse = { transfers: results, total: results.length, query };
  response.json(body);
});
