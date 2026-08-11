package com.cibertec.proyecto_final.services.implementation;

import com.cibertec.proyecto_final.entities.EgresoEntity;
import com.cibertec.proyecto_final.repositories.IEgresoRepository;
import com.cibertec.proyecto_final.services.IReporteService;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReporteService implements IReporteService {

    private final IEgresoRepository egresoRepository;

    @Override
    public byte[] generarReporteEgresosPorFecha(LocalDate fechaInicio, LocalDate fechaFin) {
        List<EgresoEntity> egresos = egresoRepository.findByFechaBetween(fechaInicio, fechaFin);
        return generarExcel(egresos, "Reporte Egresos por Fecha");
    }

    @Override
    public byte[] generarReporteEgresosPorCategoria(String categoria) {
        List<EgresoEntity> egresos = egresoRepository.findByCategoria(categoria);
        return generarExcel(egresos, "Reporte Egresos - " + categoria);
    }

    private byte[] generarExcel(List<EgresoEntity> egresos, String nombreHoja) {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet(nombreHoja);

            // Estilo para cabeceras
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            // Fila de cabeceras
            Row headerRow = sheet.createRow(0);
            String[] columnas = {"ID", "Tipo", "Correlativo", "Proveedor", "Fecha",
                    "Subtotal", "IGV", "Total", "Motivo", "Categoría"};

            for (int i = 0; i < columnas.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columnas[i]);
                cell.setCellStyle(headerStyle);
            }
            // Filas de datos
            int rowNum = 1;
            for (EgresoEntity egreso : egresos) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(egreso.getId());
                row.createCell(1).setCellValue(egreso.getTipo() != null ? egreso.getTipo() : "");
                row.createCell(2).setCellValue(egreso.getCorrelativo() != null ? egreso.getCorrelativo() : 0);
                row.createCell(3).setCellValue(egreso.getProveedor() != null ? egreso.getProveedor() : "");
                row.createCell(4).setCellValue(egreso.getFecha() != null ? egreso.getFecha().toString() : "");
                row.createCell(5).setCellValue(egreso.getSubtotal() != null ? egreso.getSubtotal().doubleValue() : 0);
                row.createCell(6).setCellValue(egreso.getIgv() != null ? egreso.getIgv().doubleValue() : 0);
                row.createCell(7).setCellValue(egreso.getTotal() != null ? egreso.getTotal().doubleValue() : 0);
                row.createCell(8).setCellValue(egreso.getMotivo() != null ? egreso.getMotivo() : "");
                row.createCell(9).setCellValue(egreso.getCategoria() != null ? egreso.getCategoria() : "");
            }
            // Auto-ajustar ancho de columnas
            for (int i = 0; i < columnas.length; i++) {
                sheet.autoSizeColumn(i);
            }
            // Convertir a bytes
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            return outputStream.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Error al generar el reporte Excel: " + e.getMessage());
        }
    }
}