-- Catálogo base que necesita la app en cualquier entorno (no son datos de demo).
INSERT INTO "categoria" ("id", "nombre", "descripcion", "orden") VALUES
  ('plomeria', 'Plomería', 'Pérdidas, destapes y instalaciones', 1),
  ('electricidad', 'Electricidad', 'Tableros, tomas y luminarias', 2),
  ('pintura', 'Pintura', 'Interiores, exteriores y detalles', 3),
  ('carpinteria', 'Carpintería', 'Muebles, puertas y reparaciones', 4)
ON CONFLICT ("id") DO NOTHING;
--> statement-breakpoint
INSERT INTO "barrio" ("nombre", "orden") VALUES
  ('Palermo', 1),
  ('Belgrano', 2),
  ('Caballito', 3),
  ('Recoleta', 4),
  ('Villa Urquiza', 5),
  ('Villa Crespo', 6),
  ('Colegiales', 7)
ON CONFLICT ("nombre") DO NOTHING;
