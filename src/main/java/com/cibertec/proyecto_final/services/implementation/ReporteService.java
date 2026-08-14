package com.cibertec.proyecto_final.services.implementation;

import com.cibertec.proyecto_final.entities.BancoEntity;
import com.cibertec.proyecto_final.entities.EgresoEntity;
import com.cibertec.proyecto_final.entities.ReciboEntity;
import com.cibertec.proyecto_final.entities.SocioEntity;
import com.cibertec.proyecto_final.repositories.IBancoRepository;
import com.cibertec.proyecto_final.repositories.IEgresoRepository;
import com.cibertec.proyecto_final.repositories.IReciboRepository;
import com.cibertec.proyecto_final.repositories.ISocioRepository;
import com.cibertec.proyecto_final.services.IReporteService;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.YearMonth;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReporteService implements IReporteService {

    private final IEgresoRepository egresoRepository;
    private final IReciboRepository iReciboRepository;
    private final ISocioRepository iSocioRepository;
    private final IBancoRepository iBancoRepository;

    @Override
    public byte[] generarReporteEgresosPorFecha(LocalDate fechaInicio, LocalDate fechaFin) {
        List<EgresoEntity> egresos = egresoRepository.findByFechaBetween(fechaInicio, fechaFin);
        return generarExcelEgresos(egresos, "Reporte Egresos por Fecha");
    }

    @Override
    public byte[] generarReporteEgresosPorCategoria(String categoria) {
        List<EgresoEntity> egresos = egresoRepository.findByCategoria(categoria);
        return generarExcelEgresos(egresos, "Reporte Egresos - " + categoria);
    }

    // RF-32: movimientos diarios de recibos de ingreso.
    @Override
    public byte[] generarReporteRecibosPorFecha(LocalDate fecha) {
        LocalDateTime desde = fecha.atStartOfDay();
        LocalDateTime hasta = fecha.atTime(LocalTime.MAX);
        List<ReciboEntity> recibos = iReciboRepository.findByTipoAndFechaBetween("INGRESO", desde, hasta);
        return generarExcelRecibos(recibos, "Recibos del " + fecha);
    }

    // RF-32: totales y movimientos del mes (ingresos + bancarios).
    @Override
    public byte[] generarReporteRecibosPorMes(int anio, int mes) {
        YearMonth ym = YearMonth.of(anio, mes);
        LocalDateTime desde = ym.atDay(1).atStartOfDay();
        LocalDateTime hasta = ym.atEndOfMonth().atTime(LocalTime.MAX);

        List<ReciboEntity> ingresos = iReciboRepository.findByTipoAndFechaBetween("INGRESO", desde, hasta);
        List<ReciboEntity> bancarios = iReciboRepository.findByTipoAndFechaBetween("BANCO", desde, hasta);
        List<ReciboEntity> todos = new java.util.ArrayList<>();
        todos.addAll(ingresos);
        todos.addAll(bancarios);
        return generarExcelRecibos(todos, "Recibos " + ym);
    }

    // RF-33: listado de socios.
    @Override
    public byte[] generarReporteSocios() {
        List<SocioEntity> socios = iSocioRepository.findAll();
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Socios");
            String[] columnas = {"ID", "Código", "Nombre", "Apellidos", "Acción", "Etapa", "Fecha nacimiento"};
            escribirCabecera(workbook, sheet, columnas);

            int rowNum = 1;
            for (SocioEntity s : socios) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(s.getId());
                row.createCell(1).setCellValue(valor(s.getCodigo()));
                row.createCell(2).setCellValue(valor(s.getNombre()));
                row.createCell(3).setCellValue(valor(s.getApellidos()));
                row.createCell(4).setCellValue(valor(s.getAccion()));
                row.createCell(5).setCellValue(valor(s.getEtapa()));
                row.createCell(6).setCellValue(s.getFechaNacimiento() != null ? s.getFechaNacimiento().toString() : "");
            }
            autoAjustar(sheet, columnas.length);
            return aBytes(workbook);
        } catch (Exception e) {
            throw new RuntimeException("Error al generar el reporte de socios: " + e.getMessage());
        }
    }

    // RF-33: "no socios" = ingresos externos (recibos sin socio ni puesto asociado, ver RF-25).
    @Override
    public byte[] generarReporteNoSocios() {
        List<ReciboEntity> recibos = iReciboRepository.findAll().stream()
                .filter(r -> "INGRESO".equals(r.getTipo()) && r.getSocio() == null && r.getPuesto() == null)
                .toList();
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Ingresos de no socios");
            String[] columnas = {"ID", "Correlativo", "Fecha", "Depositante", "Categoría", "Concepto", "Monto"};
            escribirCabecera(workbook, sheet, columnas);

            int rowNum = 1;
            for (ReciboEntity r : recibos) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(r.getId());
                row.createCell(1).setCellValue(r.getCorrelativo() != null ? r.getCorrelativo() : 0);
                row.createCell(2).setCellValue(r.getFecha() != null ? r.getFecha().toString() : "");
                row.createCell(3).setCellValue(valor(r.getDepositante()));
                row.createCell(4).setCellValue(valor(r.getCategoria()));
                row.createCell(5).setCellValue(valor(r.getConcepto()));
                row.createCell(6).setCellValue(r.getMonto() != null ? r.getMonto().doubleValue() : 0);
            }
            autoAjustar(sheet, columnas.length);
            return aBytes(workbook);
        } catch (Exception e) {
            throw new RuntimeException("Error al generar el reporte de no socios: " + e.getMessage());
        }
    }

    // RF-33: listado del catálogo de bancos.
    @Override
    public byte[] generarReporteBancos() {
        List<BancoEntity> bancos = iBancoRepository.findAll();
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Bancos");
            String[] columnas = {"ID", "Nombre", "N° Cuenta", "CCI", "Moneda"};
            escribirCabecera(workbook, sheet, columnas);

            int rowNum = 1;
            for (BancoEntity b : bancos) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(b.getId());
                row.createCell(1).setCellValue(valor(b.getNombre()));
                row.createCell(2).setCellValue(valor(b.getNumeroCuenta()));
                row.createCell(3).setCellValue(valor(b.getCci()));
                row.createCell(4).setCellValue(valor(b.getMoneda()));
            }
            autoAjustar(sheet, columnas.length);
            return aBytes(workbook);
        } catch (Exception e) {
            throw new RuntimeException("Error al generar el reporte de bancos: " + e.getMessage());
        }
    }

    // ---------- helpers ----------

    private byte[] generarExcelEgresos(List<EgresoEntity> egresos, String nombreHoja) {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet(nombreHoja);
            String[] columnas = {"ID", "Tipo", "Correlativo", "Proveedor", "Fecha",
                    "Subtotal", "IGV", "Total", "Motivo", "Categoría"};
            escribirCabecera(workbook, sheet, columnas);

            int rowNum = 1;
            for (EgresoEntity egreso : egresos) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(egreso.getId());
                row.createCell(1).setCellValue(valor(egreso.getTipo()));
                row.createCell(2).setCellValue(egreso.getCorrelativo() != null ? egreso.getCorrelativo() : 0);
                row.createCell(3).setCellValue(valor(egreso.getProveedor()));
                row.createCell(4).setCellValue(egreso.getFecha() != null ? egreso.getFecha().toString() : "");
                row.createCell(5).setCellValue(egreso.getSubtotal() != null ? egreso.getSubtotal().doubleValue() : 0);
                row.createCell(6).setCellValue(egreso.getIgv() != null ? egreso.getIgv().doubleValue() : 0);
                row.createCell(7).setCellValue(egreso.getTotal() != null ? egreso.getTotal().doubleValue() : 0);
                row.createCell(8).setCellValue(valor(egreso.getMotivo()));
                row.createCell(9).setCellValue(valor(egreso.getCategoria()));
            }
            autoAjustar(sheet, columnas.length);
            return aBytes(workbook);
        } catch (Exception e) {
            throw new RuntimeException("Error al generar el reporte Excel: " + e.getMessage());
        }
    }

    private byte[] generarExcelRecibos(List<ReciboEntity> recibos, String nombreHoja) {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet(nombreHoja);
            String[] columnas = {"ID", "Tipo", "Correlativo", "Fecha", "Monto",
                    "Socio", "Puesto", "Banco", "Concepto", "Categoría", "Depositante"};
            escribirCabecera(workbook, sheet, columnas);

            int rowNum = 1;
            for (ReciboEntity r : recibos) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(r.getId());
                row.createCell(1).setCellValue(valor(r.getTipo()));
                row.createCell(2).setCellValue(r.getCorrelativo() != null ? r.getCorrelativo() : 0);
                row.createCell(3).setCellValue(r.getFecha() != null ? r.getFecha().toString() : "");
                row.createCell(4).setCellValue(r.getMonto() != null ? r.getMonto().doubleValue() : 0);
                row.createCell(5).setCellValue(r.getSocio() != null ? (r.getSocio().getNombre() + " " + r.getSocio().getApellidos()) : "");
                row.createCell(6).setCellValue(r.getPuesto() != null ? valor(r.getPuesto().getNumero()) : "");
                row.createCell(7).setCellValue(r.getBanco() != null ? valor(r.getBanco().getNombre()) : "");
                row.createCell(8).setCellValue(valor(r.getConcepto()));
                row.createCell(9).setCellValue(valor(r.getCategoria()));
                row.createCell(10).setCellValue(valor(r.getDepositante()));
            }
            autoAjustar(sheet, columnas.length);
            return aBytes(workbook);
        } catch (Exception e) {
            throw new RuntimeException("Error al generar el reporte Excel: " + e.getMessage());
        }
    }

    private void escribirCabecera(Workbook workbook, Sheet sheet, String[] columnas) {
        CellStyle headerStyle = workbook.createCellStyle();
        Font headerFont = workbook.createFont();
        headerFont.setBold(true);
        headerStyle.setFont(headerFont);
        headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
        headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

        Row headerRow = sheet.createRow(0);
        for (int i = 0; i < columnas.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(columnas[i]);
            cell.setCellStyle(headerStyle);
        }
    }

    private void autoAjustar(Sheet sheet, int columnas) {
        for (int i = 0; i < columnas; i++) {
            sheet.autoSizeColumn(i);
        }
    }

    private byte[] aBytes(Workbook workbook) throws Exception {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        workbook.write(outputStream);
        return outputStream.toByteArray();
    }

    private String valor(String texto) {
        return texto != null ? texto : "";
    }
}
