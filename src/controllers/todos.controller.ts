import { Response } from 'express';
import { AuthRequest } from '../types/index.js';
import * as todosService from '../services/todos.service.js';
import { createTodoSchema, updateTodoSchema } from '../validators/todos.schema.js';

export async function getAll(req: AuthRequest, res: Response) {
  try {
    const result = await todosService.getAll({
      status: req.query.status as string,
      assigned_to: req.query.assigned_to as string,
      customer_id: req.query.customer_id as string,
    });
    res.json(result);
  } catch {
    res.status(500).json({ error: 'Fehler beim Laden der Todos' });
  }
}

export async function create(req: AuthRequest, res: Response) {
  try {
    const parsed = createTodoSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: parsed.error.errors[0].message }); return; }
    const todo = await todosService.create(parsed.data, req.user!.id);
    res.status(201).json(todo);
  } catch {
    res.status(500).json({ error: 'Fehler beim Erstellen des Todos' });
  }
}

export async function update(req: AuthRequest, res: Response) {
  try {
    const parsed = updateTodoSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: parsed.error.errors[0].message }); return; }
    const todo = await todosService.update(req.params.id, parsed.data);
    if (!todo) { res.status(404).json({ error: 'Todo nicht gefunden' }); return; }
    res.json(todo);
  } catch {
    res.status(500).json({ error: 'Fehler beim Aktualisieren des Todos' });
  }
}

export async function remove(req: AuthRequest, res: Response) {
  try {
    const deleted = await todosService.remove(req.params.id);
    if (!deleted) { res.status(404).json({ error: 'Todo nicht gefunden' }); return; }
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Fehler beim Löschen des Todos' });
  }
}
