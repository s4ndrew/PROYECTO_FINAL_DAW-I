-- Datos de prueba para bd_galeria_comercial
USE bd_galeria_comercial;

INSERT INTO giros (nombre, descripcion) VALUES
('Abarrotes', 'Venta de productos de primera necesidad'),
('Ropa', 'Venta de prendas de vestir'),
('Comida', 'Venta de comida preparada'),
('Electrónica', 'Venta de equipos electrónicos'),
('Ferretería', 'Venta de materiales de construcción');

INSERT INTO socios (codigo, nombre, apellidos, accion, etapa, fecha_nacimiento) VALUES
('SOC-001', 'Jorge', 'Fernandez Lopez', 'TITULAR', 'I', '1980-05-15'),
('SOC-002', 'Lucia', 'Torres Medina', 'TITULAR', 'I', '1975-08-22'),
('SOC-003', 'Carlos', 'Quispe Ramos', 'TITULAR', 'II', '1990-03-10'),
('SOC-004', 'Maria', 'Huaman Diaz', 'TITULAR', 'II', '1985-12-01'),
('SOC-005', 'Pedro', 'Vargas Cruz', 'TITULAR', 'I', '1978-07-18');

INSERT INTO servicios (nombre, recurrencia, moneda, costo, destino_cargo, tipo_costo, estado, costo_unitario) VALUES
('Luz', 'MENSUAL', 'PEN', NULL, 'PUESTO', 'CONSUMO', 1, 0.85),
('Agua', 'MENSUAL', 'PEN', NULL, 'PUESTO', 'CONSUMO', 1, 1.20),
('Limpieza', 'MENSUAL', 'PEN', 50.00, 'PUESTO', 'FIJO', 1, NULL),
('Mantenimiento', 'MENSUAL', 'PEN', 30.00, 'SOCIO', 'FIJO', 1, NULL),
('Seguridad', 'MENSUAL', 'PEN', 25.00, 'PUESTO', 'FIJO', 1, NULL);

INSERT INTO puestos (id, numero, giro_id, socio_id, vigencia_inicio, vigencia_fin) VALUES
(1, 'A-101', 1, 1, '2026-01-01', '2026-12-31'),
(2, 'A-102', 2, 2, '2026-01-01', '2026-12-31'),
(3, 'B-201', 3, 3, '2026-01-01', '2026-12-31'),
(4, 'B-202', 4, 4, '2026-01-01', '2026-12-31'),
(5, 'C-301', 5, 5, '2026-01-01', '2026-12-31');

INSERT INTO bancos (nombre, numero_cuenta, cci, moneda) VALUES
('BCP', '191-123456-0-01', '00219100123456001', 'PEN'),
('Interbank', '200-987654-0-02', '00320000987654002', 'PEN'),
('BBVA', '011-456789-0-03', '01101100456789003', 'PEN');
