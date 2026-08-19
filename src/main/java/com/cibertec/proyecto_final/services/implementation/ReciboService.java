package com.cibertec.proyecto_final.services.implementation;

import com.cibertec.proyecto_final.entities.BancoEntity;
import com.cibertec.proyecto_final.entities.CuentaCobrarEntity;
import com.cibertec.proyecto_final.entities.PuestoEntity;
import com.cibertec.proyecto_final.entities.ReciboEntity;
import com.cibertec.proyecto_final.entities.SocioEntity;
import com.cibertec.proyecto_final.entities.UsuarioEntity;
import com.cibertec.proyecto_final.models.CanjeBancarioRequest;
import com.cibertec.proyecto_final.models.IngresoExternoRequest;
import com.cibertec.proyecto_final.models.PagoRequest;
import com.cibertec.proyecto_final.models.Puesto;
import com.cibertec.proyecto_final.models.Recibo;
import com.cibertec.proyecto_final.repositories.IBancoRepository;
import com.cibertec.proyecto_final.repositories.ICuentaCobrarRepository;
import com.cibertec.proyecto_final.repositories.IReciboRepository;
import com.cibertec.proyecto_final.repositories.IUsuarioRepository;
import com.cibertec.proyecto_final.services.IAuditoriaService;
import com.cibertec.proyecto_final.services.ICorrelativoService;
import com.cibertec.proyecto_final.services.IReciboService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.ObjectMapper;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReciboService implements IReciboService {

    private final IReciboRepository iReciboRepository;
    private final ICuentaCobrarRepository iCuentaCobrarRepository;
    private final IBancoRepository iBancoRepository;
    private final IUsuarioRepository iUsuarioRepository;
    private final ICorrelativoService iCorrelativoService;
    private final IAuditoriaService iAuditoriaService;
    private final ObjectMapper objectMapper;

    @Override
    public Recibo get(Long id) {
        return iReciboRepository.findById(id)
                .map(this::convertirAModelo)
                .orElseThrow(() -> new IllegalArgumentException("El recibo " + id + " no existe"));
    }

    @Override
    public List<Recibo> getAll() {
        return iReciboRepository.findAll().stream()
                .map(this::convertirAModelo)
                .toList();
    }

    @Override
    public List<Recibo> listarPorSocio(Long socioId) {
        return iReciboRepository.findBySocio_Id(socioId).stream()
                .map(this::convertirAModelo)
                .toList();
    }

    @Override
    public List<Recibo> listarPorPuesto(Long puestoId) {
        return iReciboRepository.findByPuesto_Id(puestoId).stream()
                .map(this::convertirAModelo)
                .toList();
    }

    @Override
    public List<Recibo> listarIngresosPorFecha(LocalDate fecha) {
        LocalDateTime desde = fecha.atStartOfDay();
        LocalDateTime hasta = fecha.atTime(LocalTime.MAX);
        return iReciboRepository.findByTipoAndFechaBetween("INGRESO", desde, hasta).stream()
                .map(this::convertirAModelo)
                .toList();
    }

    @Override
    public List<Recibo> listarBancariosPorFecha(LocalDate fecha) {
        return iReciboRepository.findByTipoAndFechaDeposito("BANCO", fecha).stream()
                .map(this::convertirAModelo)
                .toList();
    }

    @Override
    @Transactional
    public Recibo procesarPago(PagoRequest request) {
        List<CuentaCobrarEntity> cuentas = request.getCuentaIds().stream()
                .map(id -> iCuentaCobrarRepository.findById(id)
                        .orElseThrow(() -> new IllegalArgumentException("La cuenta " + id + " no existe")))
                .toList();

        UsuarioEntity usuario = iUsuarioRepository.findById(request.getUsuarioId())
                .orElseThrow(() -> new IllegalArgumentException("El usuario " + request.getUsuarioId() + " no existe"));

        BigDecimal total = cuentas.stream()
                .map(CuentaCobrarEntity::getMonto)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        for (CuentaCobrarEntity cuenta : cuentas) {
            cuenta.setEstado("ABONADA");
        }
        iCuentaCobrarRepository.saveAll(cuentas);

        SocioEntity socio = cuentas.get(0).getSocio();
        PuestoEntity puesto = cuentas.get(0).getPuesto();

        Long correlativo = iCorrelativoService.generarSiguiente("INGRESO");
        ReciboEntity recibo = ReciboEntity.builder()
                .tipo("INGRESO")
                .correlativo(correlativo)
                .fecha(LocalDateTime.now())
                .monto(total)
                .socio(socio)
                .puesto(puesto)
                .usuario(usuario)
                .concepto("Pago de cuentas por cobrar")
                .build();

        ReciboEntity guardado = iReciboRepository.save(recibo);
        iAuditoriaService.registrar(usuario.getId(), "Recibo", guardado.getId(), "PAGO",
                "Pago de " + total + " sobre las cuentas " + request.getCuentaIds());
        return convertirAModelo(guardado);
    }

    @Override
    @Transactional
    public Recibo canjearCuentaBancaria(CanjeBancarioRequest request) {
        CuentaCobrarEntity cuenta = iCuentaCobrarRepository.findById(request.getCuentaId())
                .orElseThrow(() -> new IllegalArgumentException("La cuenta " + request.getCuentaId() + " no existe"));
        if (cuenta.getSocio() == null) {
            throw new IllegalArgumentException("Solo se pueden canjear cuentas de socio");
        }
        BancoEntity banco = iBancoRepository.findById(request.getBancoId())
                .orElseThrow(() -> new IllegalArgumentException("El banco " + request.getBancoId() + " no existe"));
        UsuarioEntity usuario = iUsuarioRepository.findById(request.getUsuarioId())
                .orElseThrow(() -> new IllegalArgumentException("El usuario " + request.getUsuarioId() + " no existe"));

        cuenta.setEstado("ABONADA");
        iCuentaCobrarRepository.save(cuenta);

        Long correlativo = iCorrelativoService.generarSiguiente("BANCO");
        ReciboEntity recibo = ReciboEntity.builder()
                .tipo("BANCO")
                .correlativo(correlativo)
                .fecha(LocalDateTime.now())
                .monto(cuenta.getMonto())
                .socio(cuenta.getSocio())
                .puesto(cuenta.getPuesto())
                .banco(banco)
                .usuario(usuario)
                .fechaDeposito(request.getFechaDeposito())
                .concepto("Canje bancario de cuenta por cobrar")
                .build();

        ReciboEntity guardado = iReciboRepository.save(recibo);
        iAuditoriaService.registrar(usuario.getId(), "Recibo", guardado.getId(), "CANJE",
                "Canje bancario de la cuenta " + cuenta.getId() + " al banco " + banco.getId());
        return convertirAModelo(guardado);
    }

    @Override
    @Transactional
    public Recibo registrarIngresoExterno(IngresoExternoRequest request) {
        UsuarioEntity usuario = iUsuarioRepository.findById(request.getUsuarioId())
                .orElseThrow(() -> new IllegalArgumentException("El usuario " + request.getUsuarioId() + " no existe"));

        Long correlativo = iCorrelativoService.generarSiguiente("INGRESO");
        ReciboEntity recibo = ReciboEntity.builder()
                .tipo("INGRESO")
                .correlativo(correlativo)
                .fecha(LocalDateTime.now())
                .monto(request.getMonto())
                .usuario(usuario)
                .depositante(request.getDepositante())
                .categoria(request.getCategoria())
                .concepto(request.getConcepto())
                .build();

        ReciboEntity guardado = iReciboRepository.save(recibo);
        iAuditoriaService.registrar(usuario.getId(), "Recibo", guardado.getId(), "INGRESO_EXTERNO",
                "Ingreso externo de " + request.getMonto() + " (" + request.getDepositante() + ")");
        return convertirAModelo(guardado);
    }

    private Recibo convertirAModelo(ReciboEntity entity) {
        Recibo recibo = objectMapper.convertValue(entity, Recibo.class);
        if (entity.getPuesto() != null && recibo.getPuesto() != null) {
            completarReferenciasPuesto(recibo.getPuesto(), entity.getPuesto());
        }
        return recibo;
    }

    private void completarReferenciasPuesto(Puesto puestoModelo, PuestoEntity puestoEntity) {
        puestoModelo.setSocioId(puestoEntity.getSocio() != null ? puestoEntity.getSocio().getId() : null);
        puestoModelo.setGiroId(puestoEntity.getGiro() != null ? puestoEntity.getGiro().getId() : null);
    }
}
