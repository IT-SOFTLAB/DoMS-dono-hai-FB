package com.doms.doms;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.http.MediaType;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class DomsApplicationTests {
	@Autowired MockMvc mvc;

	@Test
	void contextLoads() {
	}

	@Test void publicCreationRoutesReachValidationWithoutAuthentication() throws Exception {
		mvc.perform(post("/api/public/organizations").contentType(MediaType.APPLICATION_JSON).content("{}" )).andExpect(status().isBadRequest());
		mvc.perform(post("/api/public/users").contentType(MediaType.APPLICATION_JSON).content("{}" )).andExpect(status().isBadRequest());
	}

	@Test void unrelatedAdminAndDocumentRoutesRemainProtected() throws Exception {
		mvc.perform(get("/api/admin/users")).andExpect(status().isUnauthorized());
		mvc.perform(get("/api/documents")).andExpect(status().isUnauthorized());
	}

}
