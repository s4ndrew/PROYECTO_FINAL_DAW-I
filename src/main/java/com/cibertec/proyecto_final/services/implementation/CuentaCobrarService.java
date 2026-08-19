package com.cibertec.proyecto_final.services.implementation;

import com.cibertec.proyecto_final.entities.CuentaCobrarEntity;
import com.cibertec.proyecto_final.entities.PuestoEntity;
import com.cibertec.proyecto_final.entities.ServicioEntity;
import com.cibertec.proyecto_final.entities.SocioEntity;
import com.cibertec.proyecto_final.models.CuentaCobrar;
import com.cibertec.proyecto_final.models.GenerarConsumoRequest;
import com.cibertec.proyecto_final.models.GenerarCuentasPuestoRequest;
import com.cibertec.proyecto_final.models.GenerarSociosRequest;
import com.cibertec.proyecto_final.models.Puesto;
import com.cibertec.proyecto_final.repositories.ICuentaCobrarRepository;
import com.cibertec.proyecto_final.repositories.IPuestoRepository;
import com.cibertec.proyecto_final.repositories.IServicioRepository;
import com.cibertec.proyecto_final.repositories.ISocioRepository;
import com.cibertec.proyecto_final.services.IAuditoriaService;
import com.cibertec.proyecto_final.services.ICuentaCobrarService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.ObjectMapper;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CuentaCobrarService implements ICuentaCobrarService {

    private final ICuentaCobrarRepository iCuentaCobrarRepository;
    private final IServicioRepository iServicioRepository;
    private final ISocioRepository iSocioRepository;
    private final IPuestoRepository iPuestoRepository;
    private final IAuditoriaService iAuditoriaService;
    private final ObjectMapper objectMapper;

    @Override
    public List<CuentaCobrar> listarTodas() {
        return iCuentaCobrarRepository.findAll().stream()
                .map(this::convertirAModelo)
                .toList();
    }

    @Override
    public Optional<CuentaCobrar> buscarPorId(Long id) {
        return iCuentaCobrarRepository.findById(id).map(this::convertirAModelo);
    }

    @Override
    public List<CuentaCobrar> listarPorSocio(Long socioId) {
        return iCuentaCobrarRepository.findBySocio_Id(socioId).stream()
                .map(this::convertirAModelo)
                .toList();
    }

    @Override
    public List<CuentaCobrar> listarPorPuesto(Long puestoId) {
        return iCuentaCobrarRepository.findByPuesto_Id(puestoId).stream()
                .map(this::convertirAModelo)
                .toList();
    }

    @Override
    @Transactional
    public List<CuentaCobrar> generarParaPuestos(GenerarCuentasPuestoRequest request) {
        ServicioEntity servicio = iServicioRepository.findById(request.getServicioId())
                .orElseThrow(() -> new IllegalArgumentException("El servicio " + request.getServicioId() + " no existe"));
        if (!"FIJO".equals(servicio.getTipoCosto())) {
            throw new IllegalArgumentException("Este servicio no es de costo fijo; use la generación por consumo");
        }

        List<CuentaCobrarEntity> generadas = new ArrayList<>();
        for (Long puestoId : request.getPuestoIds()) {
            if (iCuentaCobrarRepository.existsByServicio_IdAndPuesto_IdAndPeriodo(
                    request.getServicioId(), puestoId, request.getPeriodo())) {
                continue;
            }
            PuestoEntity puesto = iPuestoRepository.findById(puestoId)
                    .orElseThrow(() -> new IllegalArgumentException("El puesto " + puestoId + " no existe"));

            CuentaCobrarEntity cuenta = CuentaCobrarEntity.builder()
                    .servicio(servicio)
                    .puesto(puesto)
                    .periodo(request.getPeriodo())
                    .monto(BigDecimal.valueOf(servicio.getCosto()))
                    .estado("PENDIENTE")
                    .fechaGeneracion(LocalDateTime.now())
                    .build();
            generadas.add(iCuentaCobrarRepository.save(cuenta));
        }
        return generadas.stream().map(this::convertirAModelo).toList();
    }

    @Override
    @Transactional
    public CuentaCobrar generarPorConsumo(GenerarConsumoRequest request) {
        ServicioEntity servicio = iServicioRepository.findById(request.getServicioId())
                .orElseThrow(() -> new IllegalArgumentException("El servicio " + request.getServicioId() + " no existe"));
        if (!"CONSUMO".equals(servicio.getTipoCosto())) {
            throw new IllegalArgumentException("Este servicio no depende de consumo; use la generación por puestos");
        }
        PuestoEntity puesto = iPuestoRepository.findById(request.getPuestoId())
                .orElseThrow(() -> new IllegalArgumentException("El puesto " + request.getPuestoId() + " no existe"));

        BigDecimal consumo = request.getLecturaFinal().subtract(request.getLecturaInicial());
        if (consumo.compareTo(BigDecimal.ZERO) < 0) {
            consumo = BigDecimal.ZERO;
        }
        BigDecimal costoUnitario = servicio.getCostoUnitario() != null ? servicio.getCostoUnitario() : BigDecimal.ZERO;
        BigDecimal monto = consumo.multiply(costoUnitario);

        CuentaCobrarEntity cuenta = CuentaCobrarEntity.builder()
                .servicio(servicio)
                .puesto(puesto)
                .periodo(request.getPeriodo())
                .lecturaInicial(request.getLecturaInicial())
                .lecturaFinal(request.getLecturaFinal())
                .monto(monto)
                .estado("PENDIENTE")
                .fechaGeneracion(LocalDateTime.now())
                .build();

        return convertirAModelo(iCuentaCobrarRepository.save(cuenta));
    }

    @Override
    @Transactional
    public List<CuentaCobrar> generarParaSocios(GenerarSociosRequest request) {
        ServicioEntity servicio = iServicioRepository.findById(request.getServicioId())
                .orElseThrow(() -> new IllegalArgumentException("El servicio " + request.getServicioId() + " no existe"));

        List<SocioEntity> socios = iSocioRepository.findAll().stream()
                .filter(s -> request.getEtapas() == null || request.getEtapas().isEmpty()
                        || request.getEtapas().contains(s.getEtapa()))
                .toList();

        if (request.isSoloUnicos()) {
            Map<String, SocioEntity> unicos = new LinkedHashMap<>();
            for (SocioEntity s : socios) {
                String clave = (s.getNombre() + "|" + s.getApellidos()).toLowerCase();
                unicos.putIfAbsent(clave, s);
            }
            socios = new ArrayList<>(unicos.values());
        }

        List<CuentaCobrarEntity> generadas = new ArrayList<>();
        for (SocioEntity socio : socios) {
            if (iCuentaCobrarRepository.existsByServicio_IdAndSocio_IdAndPeriodo(
                    request.getServicioId(), socio.getId(), request.getPeriodo())) {
                continue;
            }
            CuentaCobrarEntity cuenta = CuentaCobrarEntity.builder()
                    .servicio(servicio)
                    .socio(socio)
                    .periodo(request.getPeriodo())
                    .monto(BigDecimal.valueOf(servicio.getCosto()))
                    .estado("PENDIENTE")
                    .fechaGeneracion(LocalDateTime.now())
                    .build();
            generadas.add(iCuentaCobrarRepository.save(cuenta));
        }
        return generadas.stream().map(this::convertirAModelo).toList();
    }

    @Override
    public CuentaCobrar marcarAbonada(Long id) {
        return cambiarEstado(id, "ABONADA");
    }

    @Override
    public CuentaCobrar marcarExonerada(Long id) {
        return cambiarEstado(id, "EXONERADA");
    }

    private CuentaCobrar cambiarEstado(Long id, String estado) {
        CuentaCobrarEntity cuenta = iCuentaCobrarRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("La cuenta " + id + " no existe"));
        cuenta.setEstado(estado);
        return convertirAModelo(iCuentaCobrarRepository.save(cuenta));
    }

    @Override
    public void anularCuenta(Long id, Long usuarioId) {
        if (!iCuentaCobrarRepository.existsById(id)) {
            throw new IllegalArgumentException("La cuenta " + id + " no existe");
        }
        iCuentaCobrarRepository.deleteById(id);
        iAuditoriaService.registrar(usuarioId, "CuentaCobrar", id, "ANULACION",
                "Se anuló la cuenta por cobrar " + id);
    }

    private CuentaCobrar convertirAModelo(CuentaCobrarEntity entity) {
        CuentaCobrar cuentaCobrar = objectMapper.convertValue(entity, CuentaCobrar.class);
        if (entity.getPuesto() != null && cuentaCobrar.getPuesto() != null) {
            completarReferenciasPuesto(cuentaCobrar.getPuesto(), entity.getPuesto());
        }
        return cuentaCobrar;
    }

    private void completarReferenciasPuesto(Puesto puestoModelo, PuestoEntity puestoEntity) {
        puestoModelo.setSocioId(puestoEntity.getSocio() != null ? puestoEntity.getSocio().getId() : null);
        puestoModelo.setGiroId(puestoEntity.getGiro() != null ? puestoEntity.getGiro().getId() : null);
    }
}
