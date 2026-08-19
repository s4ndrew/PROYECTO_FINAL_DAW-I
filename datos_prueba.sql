-- Datos de prueba para bd_galeria_comercial
-- Correr con la base ya creada por Hibernate (backend arrancado al menos una vez).

USE bd_galeria_comercial;

-- 1) Giros (id autoincremental normal)
INSERT INTO giros (nombre, descripcion) VALUES
  ('Restaurante', 'Comida y bebidas'),
  ('Ropa y Calzado', 'Tiendas de vestimenta'),
  ('Electronica', 'Tecnologia y electrodomesticos'),
  ('Farmacia', 'Productos de salud'),
  ('Libreria', 'Libros y utiles escolares');

-- 2) Bancos
INSERT INTO bancos (nombre, numero_cuenta, cci, moneda) VALUES
  ('Banco de Credito del Peru', '19112345678012', '00219100123456789012', 'PEN'),
  ('BBVA', '01112233445566', '01100000123456789033', 'PEN'),
  ('Interbank', '89912345678', '00389000123456789099', 'PEN'),
  ('Scotiabank', '00912345678901', '00918900123456789011', 'PEN');

-- 3) Socios
INSERT INTO socios (codigo, nombre, apellidos, accion, etapa, fecha_nacimiento) VALUES
  ('S-001', 'Carlos', 'Ramirez Soto', '1', '1', '1985-03-12'),
  ('S-002', 'Maria', 'Gonzales Perez', '1', '1', '1990-07-22'),
  ('S-003', 'Jorge', 'Fernandez Lopez', '1', '2', '1978-11-05'),
  ('S-004', 'Lucia', 'Torres Medina', '1', '2', '1995-01-30'),
  ('S-005', 'Miguel', 'Vargas Rios', '1', '1', '1982-09-14'),
  ('S-006', 'Ana', 'Castillo Rojas', '1', '3', '1988-05-08');

-- 4) Puestos
-- OJO: PuestoEntity usa GenerationType.AUTO -> Hibernate maneja el id con la tabla
-- puestos_seq, no con AUTO_INCREMENT nativo. Por eso el id se pone a mano aqui,
-- y al final se reinicia el contador de esa tabla para que el backend no choque
-- con estos ids cuando cree un puesto nuevo desde el frontend.
INSERT INTO puestos (id, numero, giro_id, socio_id, inquilino_nombre, inquilino_documento, vigencia_inicio, vigencia_fin) VALUES
  (1, 'A-101', 1, 1, 'Restaurante El Fogon', '10203040501', '2025-01-01', '2026-12-31'),
  (2, 'A-102', 2, 2, 'Moda Express', '10203040502', '2025-02-01', '2026-12-31'),
  (3, 'B-201', 3, NULL, 'TecnoStore', '10203040503', '2025-03-01', '2026-12-31'),
  (4, 'B-202', 4, 3, 'Farmacia Vida', '10203040504', '2025-01-15', '2026-12-31'),
  (5, 'C-301', 5, 4, 'Libreria Saber', '10203040505', '2025-04-01', '2026-12-31');

DELETE FROM puestos_seq;
INSERT INTO puestos_seq (next_val) VALUES (100);

-- 5) Servicios (RF-13 a RF-15)
INSERT INTO servicios (nombre, recurrencia, moneda, costo, destino_cargo, tipo_costo, costo_unitario, estado) VALUES
  ('Cuota de mantenimiento', 'MENSUAL', 'PEN', 150.00, 'PUESTO', 'FIJO', NULL, 1),
  ('Agua', 'MENSUAL', 'PEN', 0, 'PUESTO', 'CONSUMO', 3.50, 1),
  ('Luz', 'MENSUAL', 'PEN', 0, 'PUESTO', 'CONSUMO', 0.85, 1),
  ('Cuota social', 'MENSUAL', 'PEN', 50.00, 'SOCIO', 'FIJO', NULL, 1);
