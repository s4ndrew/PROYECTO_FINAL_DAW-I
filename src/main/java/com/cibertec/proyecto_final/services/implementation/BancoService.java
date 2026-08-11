package com.cibertec.proyecto_final.services.implementation;

import com.cibertec.proyecto_final.entities.BancoEntity;
import com.cibertec.proyecto_final.models.Banco;
import com.cibertec.proyecto_final.repositories.IBancoRepository;
import com.cibertec.proyecto_final.services.IBancoService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BancoService implements IBancoService {

    private final IBancoRepository iBancoRepository;
    private final ObjectMapper objectMapper;

    @Override
    public List<Banco> obtenerBancos() {
        return objectMapper.convertValue(iBancoRepository.findAll(), new TypeReference<List<Banco>>() {});
    }

    @Override
    public Banco obtenerIdBanco(Long id) {
        return objectMapper.convertValue(iBancoRepository.findById(id).orElse(null), Banco.class);
    }

    @Override
    public Banco crearBanco(Banco banco) {
        BancoEntity bancoEntity = objectMapper.convertValue(banco, BancoEntity.class);
        return objectMapper.convertValue(iBancoRepository.save(bancoEntity), Banco.class);
    }

    @Override
    public Banco editarBanco(Long id, Banco banco) {
        if (iBancoRepository.existsById(id)) {
            BancoEntity bancoEntity = objectMapper.convertValue(banco, BancoEntity.class);
            bancoEntity.setId(id);
            return objectMapper.convertValue(iBancoRepository.save(bancoEntity), Banco.class);
        }
        return null;
    }

    @Override
    public boolean eliminarBanco(Long id) {
        if (!iBancoRepository.existsById(id)) {
            return false;
        }
        iBancoRepository.deleteById(id);
        return true;
    }
}
