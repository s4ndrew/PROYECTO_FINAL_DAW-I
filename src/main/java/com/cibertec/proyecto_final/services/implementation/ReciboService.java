package com.cibertec.proyecto_final.services.implementation;

import com.cibertec.proyecto_final.entities.ReciboEntity;
import com.cibertec.proyecto_final.models.Recibo;
import com.cibertec.proyecto_final.repositories.IReciboRepository;
import com.cibertec.proyecto_final.repositories.IServicioRepository;
import com.cibertec.proyecto_final.services.IReciboService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tools.jackson.databind.ObjectMapper;

import java.awt.print.Pageable;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReciboService implements IReciboService {

    private final IReciboRepository iReciboRepository;
    private final ObjectMapper objectMapper;

    @Override
    public Recibo get(Long id) {
        return iReciboRepository.findById(id)
                .map(e -> objectMapper.convertValue(e, Recibo.class))
                .orElseThrow();
    }

    @Override
    public List<Recibo> getAll() {
        return iReciboRepository.findAll().stream()
                .map(e -> objectMapper.convertValue(e, Recibo.class))
                .toList();
    }

    @Override
    public List<Recibo> getAllFiltered(Pageable pageable) {
        return List.of();
    }

    @Override
    public List<Recibo> search(String tipo, Long correlativo) {
        return List.of();
    }
}
