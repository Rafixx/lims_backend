--
-- PostgreSQL database dump
--

-- Dumped from database version 14.13 (Ubuntu 14.13-0ubuntu0.22.04.1)
-- Dumped by pg_dump version 14.13 (Ubuntu 14.13-0ubuntu0.22.04.1)

-- Started on 2025-10-10 16:07:45 CEST

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 6 (class 2615 OID 27674)
-- Name: lims_pre; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA lims_pre;


ALTER SCHEMA lims_pre OWNER TO postgres;

--
-- TOC entry 259 (class 1255 OID 27817)
-- Name: fn_import_valores_csv(text); Type: FUNCTION; Schema: lims_pre; Owner: postgres
--

CREATE FUNCTION lims_pre.fn_import_valores_csv(p_ruta text) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    ruta_completa TEXT;
BEGIN
    -- DimPruebas: Añadimos el nombre del fichero a la ruta completa
    ruta_completa := p_ruta || '/DimPruebas_Valores.csv';

	--Vaciamos el contenido para no duplicar valores
    IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE table_name = 'dim_pruebas' AND table_schema='lims_pre')
	THEN
		EXECUTE 'TRUNCATE TABLE lims_pre.dim_pruebas';
	END IF;
	
	--Insertamos los valores del fichero CSV
	EXECUTE format(
        'COPY lims_pre.dim_pruebas (id,cod_prueba, prueba, activa, created_by) FROM %L DELIMITER %L CSV HEADER;',
        ruta_completa,
        ';' --delimitador
    );

    -- DimTecnicasProc: Añadimos el nombre del fichero a la ruta completa
    ruta_completa := p_ruta || '/DimTecnicasProc_Valores.csv';

	--Vaciamos el contenido para no duplicar valores
    IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE table_name = 'dim_tecnicas_proc' AND table_schema='lims_pre')
	THEN
		EXECUTE 'TRUNCATE TABLE lims_pre.dim_tecnicas_proc';
	END IF;
	
	--Insertamos los valores del fichero CSV
	EXECUTE format(
        'COPY lims_pre.dim_tecnicas_proc (id,tecnica_proc, orden, obligatoria, activa, created_by, id_prueba, id_plantilla_tecnica) FROM %L DELIMITER %L CSV HEADER;',
        ruta_completa,
        ';' --delimitador
    );


    -- DimPlantillaTecnica: Añadimos el nombre del fichero a la ruta completa
    ruta_completa := p_ruta || '/DimPlantillaTecnica_Valores.csv';

	--Vaciamos el contenido para no duplicar valores
    IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE table_name = 'dim_plantilla_tecnica' AND table_schema='lims_pre')
	THEN
		EXECUTE 'TRUNCATE TABLE lims_pre.dim_plantilla_tecnica';
	END IF;
	
	--Insertamos los valores del fichero CSV
	EXECUTE format(
        'COPY lims_pre.dim_plantilla_tecnica(id,cod_plantilla_tecnica,tecnica,activa,created_by) FROM %L DELIMITER %L CSV HEADER;',
        ruta_completa,
        ';' --delimitador
    );

    -- DimPipetas: Añadimos el nombre del fichero a la ruta completa
    ruta_completa := p_ruta || '/DimPipetas_Valores.csv';

	--Vaciamos el contenido para no duplicar valores
    IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE table_name = 'dim_pipetas' AND table_schema='lims_pre')
	THEN
		EXECUTE 'TRUNCATE TABLE lims_pre.dim_pipetas';
	END IF;
	
	--Insertamos los valores del fichero CSV
	EXECUTE format(
        'COPY lims_pre.dim_pipetas(id,codigo,modelo,zona,activa,created_by,id_plantilla_tecnica) FROM %L DELIMITER %L CSV HEADER;',
        ruta_completa,
        ';' --delimitador
    );

END;
$$;


ALTER FUNCTION lims_pre.fn_import_valores_csv(p_ruta text) OWNER TO postgres;

--
-- TOC entry 268 (class 1255 OID 38845)
-- Name: reiniciar_contadores(); Type: FUNCTION; Schema: lims_pre; Owner: postgres
--

CREATE FUNCTION lims_pre.reiniciar_contadores() RETURNS integer
    LANGUAGE plpgsql
    AS $$
DECLARE
    seq RECORD;
    max_id BIGINT;
BEGIN
    FOR seq IN
        SELECT 
            c.oid::regclass::text AS sequence_name,
            t.relname AS table_name,
            a.attname AS column_name
        FROM 
            pg_class c
            JOIN pg_depend d ON c.oid = d.objid
            JOIN pg_class t ON d.refobjid = t.oid
            JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = d.refobjsubid
        WHERE 
            c.relkind = 'S'
            AND d.deptype IN ('a') -- solo secuencias autogeneradas
    LOOP
        EXECUTE format('SELECT MAX(%I) FROM %I', seq.column_name, seq.table_name) INTO max_id;
        IF max_id IS NULL THEN
            max_id := 0;
        END IF;
        EXECUTE format('SELECT setval(%L, %s, false)', seq.sequence_name, max_id + 1);
        RAISE NOTICE 'Secuencia % ha sido reiniciada con valor %', seq.sequence_name, max_id + 1;
    END LOOP;

    RETURN 1;
END;
$$;


ALTER FUNCTION lims_pre.reiniciar_contadores() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 217 (class 1259 OID 27751)
-- Name: dim_cat_resultados; Type: TABLE; Schema: lims_pre; Owner: postgres
--

CREATE TABLE lims_pre.dim_cat_resultados (
    id integer NOT NULL,
    cod_resultado character varying(10),
    resultado character varying(50) NOT NULL,
    unidades character varying(50),
    valor_min character varying(10),
    valor_max character varying(10),
    created_by integer,
    update_dt timestamp without time zone DEFAULT now()
);


ALTER TABLE lims_pre.dim_cat_resultados OWNER TO postgres;

--
-- TOC entry 216 (class 1259 OID 27750)
-- Name: dim_cat_resultados_id_seq; Type: SEQUENCE; Schema: lims_pre; Owner: postgres
--

CREATE SEQUENCE lims_pre.dim_cat_resultados_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE lims_pre.dim_cat_resultados_id_seq OWNER TO postgres;

--
-- TOC entry 3668 (class 0 OID 0)
-- Dependencies: 216
-- Name: dim_cat_resultados_id_seq; Type: SEQUENCE OWNED BY; Schema: lims_pre; Owner: postgres
--

ALTER SEQUENCE lims_pre.dim_cat_resultados_id_seq OWNED BY lims_pre.dim_cat_resultados.id;


--
-- TOC entry 248 (class 1259 OID 47221)
-- Name: dim_centros; Type: TABLE; Schema: lims_pre; Owner: postgres
--

CREATE TABLE lims_pre.dim_centros (
    id integer NOT NULL,
    codigo character varying(50),
    descripcion character varying(100),
    created_by integer,
    update_dt timestamp without time zone DEFAULT now()
);


ALTER TABLE lims_pre.dim_centros OWNER TO postgres;

--
-- TOC entry 249 (class 1259 OID 47226)
-- Name: dim_centros_id_seq; Type: SEQUENCE; Schema: lims_pre; Owner: postgres
--

CREATE SEQUENCE lims_pre.dim_centros_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE lims_pre.dim_centros_id_seq OWNER TO postgres;

--
-- TOC entry 3669 (class 0 OID 0)
-- Dependencies: 249
-- Name: dim_centros_id_seq; Type: SEQUENCE OWNED BY; Schema: lims_pre; Owner: postgres
--

ALTER SEQUENCE lims_pre.dim_centros_id_seq OWNED BY lims_pre.dim_centros.id;


--
-- TOC entry 229 (class 1259 OID 33094)
-- Name: dim_clientes; Type: TABLE; Schema: lims_pre; Owner: postgres
--

CREATE TABLE lims_pre.dim_clientes (
    id integer NOT NULL,
    nombre character varying(50) DEFAULT NULL::character varying,
    razon_social character varying(100) DEFAULT NULL::character varying,
    nif character varying(20) DEFAULT NULL::character varying,
    direccion character varying(20) DEFAULT NULL::character varying,
    activo boolean DEFAULT true NOT NULL,
    created_by integer,
    update_dt timestamp with time zone NOT NULL,
    delete_dt timestamp with time zone
);


ALTER TABLE lims_pre.dim_clientes OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 33093)
-- Name: dim_clientes_id_seq; Type: SEQUENCE; Schema: lims_pre; Owner: postgres
--

CREATE SEQUENCE lims_pre.dim_clientes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE lims_pre.dim_clientes_id_seq OWNER TO postgres;

--
-- TOC entry 3670 (class 0 OID 0)
-- Dependencies: 228
-- Name: dim_clientes_id_seq; Type: SEQUENCE OWNED BY; Schema: lims_pre; Owner: postgres
--

ALTER SEQUENCE lims_pre.dim_clientes_id_seq OWNED BY lims_pre.dim_clientes.id;


--
-- TOC entry 250 (class 1259 OID 47233)
-- Name: dim_criterios_validacion; Type: TABLE; Schema: lims_pre; Owner: postgres
--

CREATE TABLE lims_pre.dim_criterios_validacion (
    id integer NOT NULL,
    codigo character varying(10),
    descripcion character varying(100),
    created_by integer,
    update_dt timestamp without time zone DEFAULT now()
);


ALTER TABLE lims_pre.dim_criterios_validacion OWNER TO postgres;

--
-- TOC entry 251 (class 1259 OID 47236)
-- Name: dim_criterios_validacion_id_seq; Type: SEQUENCE; Schema: lims_pre; Owner: postgres
--

CREATE SEQUENCE lims_pre.dim_criterios_validacion_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE lims_pre.dim_criterios_validacion_id_seq OWNER TO postgres;

--
-- TOC entry 3671 (class 0 OID 0)
-- Dependencies: 251
-- Name: dim_criterios_validacion_id_seq; Type: SEQUENCE OWNED BY; Schema: lims_pre; Owner: postgres
--

ALTER SEQUENCE lims_pre.dim_criterios_validacion_id_seq OWNED BY lims_pre.dim_criterios_validacion.id;


--
-- TOC entry 255 (class 1259 OID 49476)
-- Name: dim_estados; Type: TABLE; Schema: lims_pre; Owner: postgres
--

CREATE TABLE lims_pre.dim_estados (
    id integer NOT NULL,
    estado character varying(50) NOT NULL,
    entidad character varying(50),
    descripcion character varying(200),
    orden smallint,
    activo boolean,
    color character varying(10),
    es_inicial boolean,
    es_final boolean
);


ALTER TABLE lims_pre.dim_estados OWNER TO postgres;

--
-- TOC entry 254 (class 1259 OID 49475)
-- Name: dim_estados_id_seq; Type: SEQUENCE; Schema: lims_pre; Owner: postgres
--

CREATE SEQUENCE lims_pre.dim_estados_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE lims_pre.dim_estados_id_seq OWNER TO postgres;

--
-- TOC entry 3672 (class 0 OID 0)
-- Dependencies: 254
-- Name: dim_estados_id_seq; Type: SEQUENCE OWNED BY; Schema: lims_pre; Owner: postgres
--

ALTER SEQUENCE lims_pre.dim_estados_id_seq OWNED BY lims_pre.dim_estados.id;


--
-- TOC entry 223 (class 1259 OID 27786)
-- Name: dim_maquinas; Type: TABLE; Schema: lims_pre; Owner: postgres
--

CREATE TABLE lims_pre.dim_maquinas (
    id integer NOT NULL,
    codigo character varying(20),
    maquina character varying(100) NOT NULL,
    perfil_termico character varying(255),
    activa boolean DEFAULT true,
    created_by integer,
    update_dt timestamp without time zone DEFAULT now(),
    id_plantilla_tecnica integer
);


ALTER TABLE lims_pre.dim_maquinas OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 27785)
-- Name: dim_maquinas_id_seq; Type: SEQUENCE; Schema: lims_pre; Owner: postgres
--

CREATE SEQUENCE lims_pre.dim_maquinas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE lims_pre.dim_maquinas_id_seq OWNER TO postgres;

--
-- TOC entry 3673 (class 0 OID 0)
-- Dependencies: 222
-- Name: dim_maquinas_id_seq; Type: SEQUENCE OWNED BY; Schema: lims_pre; Owner: postgres
--

ALTER SEQUENCE lims_pre.dim_maquinas_id_seq OWNED BY lims_pre.dim_maquinas.id;


--
-- TOC entry 247 (class 1259 OID 38847)
-- Name: dim_pacientes; Type: TABLE; Schema: lims_pre; Owner: postgres
--

CREATE TABLE lims_pre.dim_pacientes (
    id integer NOT NULL,
    nombre character varying(50) DEFAULT NULL::character varying,
    sip character varying(10) DEFAULT NULL::character varying,
    direccion character varying(20) DEFAULT NULL::character varying,
    activo boolean DEFAULT true NOT NULL,
    created_by integer,
    update_dt timestamp with time zone NOT NULL,
    delete_dt timestamp with time zone
);


ALTER TABLE lims_pre.dim_pacientes OWNER TO postgres;

--
-- TOC entry 246 (class 1259 OID 38846)
-- Name: dim_pacientes_id_seq; Type: SEQUENCE; Schema: lims_pre; Owner: postgres
--

CREATE SEQUENCE lims_pre.dim_pacientes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE lims_pre.dim_pacientes_id_seq OWNER TO postgres;

--
-- TOC entry 3674 (class 0 OID 0)
-- Dependencies: 246
-- Name: dim_pacientes_id_seq; Type: SEQUENCE OWNED BY; Schema: lims_pre; Owner: postgres
--

ALTER SEQUENCE lims_pre.dim_pacientes_id_seq OWNED BY lims_pre.dim_pacientes.id;


--
-- TOC entry 221 (class 1259 OID 27777)
-- Name: dim_pipetas; Type: TABLE; Schema: lims_pre; Owner: postgres
--

CREATE TABLE lims_pre.dim_pipetas (
    id integer NOT NULL,
    codigo character varying(50),
    modelo character varying(100) NOT NULL,
    zona character varying(50),
    activa boolean DEFAULT true,
    created_by integer,
    update_dt timestamp without time zone DEFAULT now(),
    id_plantilla_tecnica integer
);


ALTER TABLE lims_pre.dim_pipetas OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 27776)
-- Name: dim_pipetas_id_seq; Type: SEQUENCE; Schema: lims_pre; Owner: postgres
--

CREATE SEQUENCE lims_pre.dim_pipetas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE lims_pre.dim_pipetas_id_seq OWNER TO postgres;

--
-- TOC entry 3675 (class 0 OID 0)
-- Dependencies: 220
-- Name: dim_pipetas_id_seq; Type: SEQUENCE OWNED BY; Schema: lims_pre; Owner: postgres
--

ALTER SEQUENCE lims_pre.dim_pipetas_id_seq OWNED BY lims_pre.dim_pipetas.id;


--
-- TOC entry 239 (class 1259 OID 33170)
-- Name: dim_plantilla_tecnica; Type: TABLE; Schema: lims_pre; Owner: postgres
--

CREATE TABLE lims_pre.dim_plantilla_tecnica (
    id integer NOT NULL,
    cod_plantilla_tecnica character varying(50) NOT NULL,
    tecnica character varying(100) NOT NULL,
    activa boolean DEFAULT true,
    created_by integer,
    update_dt timestamp with time zone NOT NULL
);


ALTER TABLE lims_pre.dim_plantilla_tecnica OWNER TO postgres;

--
-- TOC entry 238 (class 1259 OID 33169)
-- Name: dim_plantilla_tecnica_id_seq; Type: SEQUENCE; Schema: lims_pre; Owner: postgres
--

CREATE SEQUENCE lims_pre.dim_plantilla_tecnica_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE lims_pre.dim_plantilla_tecnica_id_seq OWNER TO postgres;

--
-- TOC entry 3676 (class 0 OID 0)
-- Dependencies: 238
-- Name: dim_plantilla_tecnica_id_seq; Type: SEQUENCE OWNED BY; Schema: lims_pre; Owner: postgres
--

ALTER SEQUENCE lims_pre.dim_plantilla_tecnica_id_seq OWNED BY lims_pre.dim_plantilla_tecnica.id;


--
-- TOC entry 231 (class 1259 OID 33107)
-- Name: dim_pruebas; Type: TABLE; Schema: lims_pre; Owner: postgres
--

CREATE TABLE lims_pre.dim_pruebas (
    id integer NOT NULL,
    cod_prueba character varying(10) DEFAULT NULL::character varying,
    prueba character varying(50) NOT NULL,
    activa boolean DEFAULT true,
    created_by integer,
    update_dt timestamp with time zone NOT NULL
);


ALTER TABLE lims_pre.dim_pruebas OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 33106)
-- Name: dim_pruebas_id_seq; Type: SEQUENCE; Schema: lims_pre; Owner: postgres
--

CREATE SEQUENCE lims_pre.dim_pruebas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE lims_pre.dim_pruebas_id_seq OWNER TO postgres;

--
-- TOC entry 3677 (class 0 OID 0)
-- Dependencies: 230
-- Name: dim_pruebas_id_seq; Type: SEQUENCE OWNED BY; Schema: lims_pre; Owner: postgres
--

ALTER SEQUENCE lims_pre.dim_pruebas_id_seq OWNED BY lims_pre.dim_pruebas.id;


--
-- TOC entry 219 (class 1259 OID 27768)
-- Name: dim_reactivos; Type: TABLE; Schema: lims_pre; Owner: postgres
--

CREATE TABLE lims_pre.dim_reactivos (
    id integer NOT NULL,
    num_referencia character varying(50),
    reactivo character varying(100) NOT NULL,
    lote character varying(20),
    volumen_formula character varying(20),
    activa boolean DEFAULT true,
    created_by integer,
    update_dt timestamp without time zone DEFAULT now(),
    id_plantilla_tecnica integer
);


ALTER TABLE lims_pre.dim_reactivos OWNER TO postgres;

--
-- TOC entry 218 (class 1259 OID 27767)
-- Name: dim_reactivos_id_seq; Type: SEQUENCE; Schema: lims_pre; Owner: postgres
--

CREATE SEQUENCE lims_pre.dim_reactivos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE lims_pre.dim_reactivos_id_seq OWNER TO postgres;

--
-- TOC entry 3678 (class 0 OID 0)
-- Dependencies: 218
-- Name: dim_reactivos_id_seq; Type: SEQUENCE OWNED BY; Schema: lims_pre; Owner: postgres
--

ALTER SEQUENCE lims_pre.dim_reactivos_id_seq OWNED BY lims_pre.dim_reactivos.id;


--
-- TOC entry 241 (class 1259 OID 33178)
-- Name: dim_tecnicas_proc; Type: TABLE; Schema: lims_pre; Owner: postgres
--

CREATE TABLE lims_pre.dim_tecnicas_proc (
    id integer NOT NULL,
    tecnica_proc character varying(50) NOT NULL,
    orden integer,
    obligatoria boolean DEFAULT true,
    activa boolean DEFAULT true,
    created_by integer,
    update_dt timestamp with time zone NOT NULL,
    id_prueba integer,
    id_plantilla_tecnica integer
);


ALTER TABLE lims_pre.dim_tecnicas_proc OWNER TO postgres;

--
-- TOC entry 240 (class 1259 OID 33177)
-- Name: dim_tecnicas_proc_id_seq; Type: SEQUENCE; Schema: lims_pre; Owner: postgres
--

CREATE SEQUENCE lims_pre.dim_tecnicas_proc_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE lims_pre.dim_tecnicas_proc_id_seq OWNER TO postgres;

--
-- TOC entry 3679 (class 0 OID 0)
-- Dependencies: 240
-- Name: dim_tecnicas_proc_id_seq; Type: SEQUENCE OWNED BY; Schema: lims_pre; Owner: postgres
--

ALTER SEQUENCE lims_pre.dim_tecnicas_proc_id_seq OWNED BY lims_pre.dim_tecnicas_proc.id;


--
-- TOC entry 215 (class 1259 OID 27724)
-- Name: dim_tipo_muestra; Type: TABLE; Schema: lims_pre; Owner: postgres
--

CREATE TABLE lims_pre.dim_tipo_muestra (
    id integer NOT NULL,
    cod_tipo_muestra character varying(10),
    tipo_muestra character varying(50) NOT NULL,
    created_by integer,
    update_dt timestamp without time zone DEFAULT now()
);


ALTER TABLE lims_pre.dim_tipo_muestra OWNER TO postgres;

--
-- TOC entry 214 (class 1259 OID 27723)
-- Name: dim_tipo_muestra_id_seq; Type: SEQUENCE; Schema: lims_pre; Owner: postgres
--

CREATE SEQUENCE lims_pre.dim_tipo_muestra_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE lims_pre.dim_tipo_muestra_id_seq OWNER TO postgres;

--
-- TOC entry 3680 (class 0 OID 0)
-- Dependencies: 214
-- Name: dim_tipo_muestra_id_seq; Type: SEQUENCE OWNED BY; Schema: lims_pre; Owner: postgres
--

ALTER SEQUENCE lims_pre.dim_tipo_muestra_id_seq OWNED BY lims_pre.dim_tipo_muestra.id;


--
-- TOC entry 227 (class 1259 OID 27964)
-- Name: dim_ubicacion; Type: TABLE; Schema: lims_pre; Owner: postgres
--

CREATE TABLE lims_pre.dim_ubicacion (
    id integer NOT NULL,
    codigo character varying(20),
    ubicacion character varying(100) NOT NULL,
    activa boolean DEFAULT true,
    created_by integer,
    update_dt timestamp without time zone DEFAULT now()
);


ALTER TABLE lims_pre.dim_ubicacion OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 27963)
-- Name: dim_ubicacion_id_seq; Type: SEQUENCE; Schema: lims_pre; Owner: postgres
--

CREATE SEQUENCE lims_pre.dim_ubicacion_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE lims_pre.dim_ubicacion_id_seq OWNER TO postgres;

--
-- TOC entry 3681 (class 0 OID 0)
-- Dependencies: 226
-- Name: dim_ubicacion_id_seq; Type: SEQUENCE OWNED BY; Schema: lims_pre; Owner: postgres
--

ALTER SEQUENCE lims_pre.dim_ubicacion_id_seq OWNED BY lims_pre.dim_ubicacion.id;


--
-- TOC entry 235 (class 1259 OID 33135)
-- Name: muestra; Type: TABLE; Schema: lims_pre; Owner: postgres
--

CREATE TABLE lims_pre.muestra (
    id_muestra integer NOT NULL,
    id_paciente integer,
    id_solicitud integer NOT NULL,
    id_tecnico_resp integer,
    id_tipo_muestra integer,
    id_centro_externo integer,
    id_criterio_val integer,
    id_ubicacion integer,
    tipo_array boolean,
    codigo_epi character varying(50) DEFAULT NULL::character varying,
    codigo_externo character varying(50) DEFAULT NULL::character varying,
    f_toma timestamp with time zone,
    f_recepcion timestamp with time zone,
    f_destruccion timestamp with time zone,
    f_devolucion timestamp with time zone,
    agotada boolean DEFAULT false,
    estado_muestra character varying(20) DEFAULT 'CREADA'::character varying,
    update_dt timestamp with time zone NOT NULL,
    delete_dt timestamp with time zone,
    created_by integer,
    updated_by integer,
    id_prueba integer,
    id_estado smallint
);


ALTER TABLE lims_pre.muestra OWNER TO postgres;

--
-- TOC entry 211 (class 1259 OID 27697)
-- Name: muestra_array; Type: TABLE; Schema: lims_pre; Owner: postgres
--

CREATE TABLE lims_pre.muestra_array (
    id_array integer NOT NULL,
    id_muestra integer,
    id_posicion integer,
    codigo_placa character varying(50) DEFAULT NULL::character varying,
    posicion_placa character varying(10),
    f_creacion timestamp without time zone,
    f_envio_escanear date,
    num_array integer,
    num_serie character varying(50),
    pos_array character varying(20),
    delete_dt date,
    update_dt timestamp without time zone DEFAULT now(),
    created_by integer,
    updated_by integer
);


ALTER TABLE lims_pre.muestra_array OWNER TO postgres;

--
-- TOC entry 210 (class 1259 OID 27696)
-- Name: muestra_array_id_array_seq; Type: SEQUENCE; Schema: lims_pre; Owner: postgres
--

CREATE SEQUENCE lims_pre.muestra_array_id_array_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE lims_pre.muestra_array_id_array_seq OWNER TO postgres;

--
-- TOC entry 3682 (class 0 OID 0)
-- Dependencies: 210
-- Name: muestra_array_id_array_seq; Type: SEQUENCE OWNED BY; Schema: lims_pre; Owner: postgres
--

ALTER SEQUENCE lims_pre.muestra_array_id_array_seq OWNED BY lims_pre.muestra_array.id_array;


--
-- TOC entry 234 (class 1259 OID 33134)
-- Name: muestra_id_muestra_seq; Type: SEQUENCE; Schema: lims_pre; Owner: postgres
--

CREATE SEQUENCE lims_pre.muestra_id_muestra_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE lims_pre.muestra_id_muestra_seq OWNER TO postgres;

--
-- TOC entry 3683 (class 0 OID 0)
-- Dependencies: 234
-- Name: muestra_id_muestra_seq; Type: SEQUENCE OWNED BY; Schema: lims_pre; Owner: postgres
--

ALTER SEQUENCE lims_pre.muestra_id_muestra_seq OWNED BY lims_pre.muestra.id_muestra;


--
-- TOC entry 225 (class 1259 OID 27956)
-- Name: muestra_ubicacion; Type: TABLE; Schema: lims_pre; Owner: postgres
--

CREATE TABLE lims_pre.muestra_ubicacion (
    id_muestra_ubic integer NOT NULL,
    id_muestra integer,
    id_ubicacion integer,
    cantidad_total character varying(50),
    cantidad_restante character varying(50),
    delete_dt date,
    update_dt timestamp without time zone DEFAULT now(),
    created_by integer,
    updated_by integer
);


ALTER TABLE lims_pre.muestra_ubicacion OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 27955)
-- Name: muestra_ubicacion_id_muestra_ubic_seq; Type: SEQUENCE; Schema: lims_pre; Owner: postgres
--

CREATE SEQUENCE lims_pre.muestra_ubicacion_id_muestra_ubic_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE lims_pre.muestra_ubicacion_id_muestra_ubic_seq OWNER TO postgres;

--
-- TOC entry 3684 (class 0 OID 0)
-- Dependencies: 224
-- Name: muestra_ubicacion_id_muestra_ubic_seq; Type: SEQUENCE OWNED BY; Schema: lims_pre; Owner: postgres
--

ALTER SEQUENCE lims_pre.muestra_ubicacion_id_muestra_ubic_seq OWNED BY lims_pre.muestra_ubicacion.id_muestra_ubic;


--
-- TOC entry 213 (class 1259 OID 27714)
-- Name: resultado; Type: TABLE; Schema: lims_pre; Owner: postgres
--

CREATE TABLE lims_pre.resultado (
    id_resultado integer NOT NULL,
    id_muestra integer,
    id_tecnica integer,
    tipo_res character varying(50),
    valor character varying(50),
    valor_texto character varying(1000),
    valor_fecha timestamp without time zone,
    unidades character varying(20),
    f_resultado timestamp without time zone,
    f_validacion timestamp without time zone,
    validado boolean,
    dentro_rango boolean,
    delete_dt date,
    update_dt timestamp without time zone DEFAULT now(),
    created_by integer,
    updated_by integer
);


ALTER TABLE lims_pre.resultado OWNER TO postgres;

--
-- TOC entry 212 (class 1259 OID 27713)
-- Name: resultado_id_resultado_seq; Type: SEQUENCE; Schema: lims_pre; Owner: postgres
--

CREATE SEQUENCE lims_pre.resultado_id_resultado_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE lims_pre.resultado_id_resultado_seq OWNER TO postgres;

--
-- TOC entry 3685 (class 0 OID 0)
-- Dependencies: 212
-- Name: resultado_id_resultado_seq; Type: SEQUENCE OWNED BY; Schema: lims_pre; Owner: postgres
--

ALTER SEQUENCE lims_pre.resultado_id_resultado_seq OWNED BY lims_pre.resultado.id_resultado;


--
-- TOC entry 243 (class 1259 OID 33197)
-- Name: roles; Type: TABLE; Schema: lims_pre; Owner: postgres
--

CREATE TABLE lims_pre.roles (
    id_rol integer NOT NULL,
    name character varying(255) NOT NULL,
    management_users boolean,
    read_only boolean,
    export boolean,
    create_dt timestamp with time zone NOT NULL,
    update_dt timestamp with time zone NOT NULL,
    delete_dt timestamp with time zone
);


ALTER TABLE lims_pre.roles OWNER TO postgres;

--
-- TOC entry 242 (class 1259 OID 33196)
-- Name: roles_id_rol_seq; Type: SEQUENCE; Schema: lims_pre; Owner: postgres
--

CREATE SEQUENCE lims_pre.roles_id_rol_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE lims_pre.roles_id_rol_seq OWNER TO postgres;

--
-- TOC entry 3686 (class 0 OID 0)
-- Dependencies: 242
-- Name: roles_id_rol_seq; Type: SEQUENCE OWNED BY; Schema: lims_pre; Owner: postgres
--

ALTER SEQUENCE lims_pre.roles_id_rol_seq OWNED BY lims_pre.roles.id_rol;


--
-- TOC entry 233 (class 1259 OID 33116)
-- Name: solicitud; Type: TABLE; Schema: lims_pre; Owner: postgres
--

CREATE TABLE lims_pre.solicitud (
    id_solicitud integer NOT NULL,
    num_solicitud character varying(20) DEFAULT NULL::character varying,
    id_cliente integer NOT NULL,
    f_creacion timestamp with time zone,
    f_entrada timestamp with time zone,
    f_compromiso timestamp with time zone,
    f_entrega timestamp with time zone,
    f_resultado timestamp with time zone,
    condiciones_envio character varying(50),
    tiempo_hielo character varying(20),
    estado_solicitud character varying(20) DEFAULT 'CREADA'::character varying NOT NULL,
    delete_dt timestamp with time zone,
    update_dt timestamp with time zone NOT NULL,
    created_by integer,
    updated_by integer
);


ALTER TABLE lims_pre.solicitud OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 33115)
-- Name: solicitud_id_solicitud_seq; Type: SEQUENCE; Schema: lims_pre; Owner: postgres
--

CREATE SEQUENCE lims_pre.solicitud_id_solicitud_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE lims_pre.solicitud_id_solicitud_seq OWNER TO postgres;

--
-- TOC entry 3687 (class 0 OID 0)
-- Dependencies: 232
-- Name: solicitud_id_solicitud_seq; Type: SEQUENCE OWNED BY; Schema: lims_pre; Owner: postgres
--

ALTER SEQUENCE lims_pre.solicitud_id_solicitud_seq OWNED BY lims_pre.solicitud.id_solicitud;


--
-- TOC entry 237 (class 1259 OID 33156)
-- Name: tecnicas; Type: TABLE; Schema: lims_pre; Owner: postgres
--

CREATE TABLE lims_pre.tecnicas (
    id_tecnica integer NOT NULL,
    id_muestra integer NOT NULL,
    id_tecnica_proc integer NOT NULL,
    id_tecnico_resp integer,
    fecha_inicio_tec timestamp with time zone,
    estado character varying(20) DEFAULT 'CREADA'::character varying,
    fecha_estado timestamp with time zone,
    comentarios character varying(255) DEFAULT NULL::character varying,
    delete_dt timestamp with time zone,
    update_dt timestamp with time zone NOT NULL,
    created_by integer,
    updated_by integer,
    id_worklist integer,
    id_estado smallint,
    id_array smallint
);


ALTER TABLE lims_pre.tecnicas OWNER TO postgres;

--
-- TOC entry 236 (class 1259 OID 33155)
-- Name: tecnicas_id_tecnica_seq; Type: SEQUENCE; Schema: lims_pre; Owner: postgres
--

CREATE SEQUENCE lims_pre.tecnicas_id_tecnica_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE lims_pre.tecnicas_id_tecnica_seq OWNER TO postgres;

--
-- TOC entry 3688 (class 0 OID 0)
-- Dependencies: 236
-- Name: tecnicas_id_tecnica_seq; Type: SEQUENCE OWNED BY; Schema: lims_pre; Owner: postgres
--

ALTER SEQUENCE lims_pre.tecnicas_id_tecnica_seq OWNED BY lims_pre.tecnicas.id_tecnica;


--
-- TOC entry 245 (class 1259 OID 33206)
-- Name: usuarios; Type: TABLE; Schema: lims_pre; Owner: postgres
--

CREATE TABLE lims_pre.usuarios (
    id_usuario integer NOT NULL,
    nombre character varying(255) DEFAULT NULL::character varying,
    username character varying(50) NOT NULL,
    passwordhash character varying(255) NOT NULL,
    email character varying(100) NOT NULL,
    id_rol integer,
    create_dt timestamp with time zone NOT NULL,
    update_dt timestamp with time zone NOT NULL,
    delete_dt timestamp with time zone
);


ALTER TABLE lims_pre.usuarios OWNER TO postgres;

--
-- TOC entry 244 (class 1259 OID 33205)
-- Name: usuarios_id_usuario_seq; Type: SEQUENCE; Schema: lims_pre; Owner: postgres
--

CREATE SEQUENCE lims_pre.usuarios_id_usuario_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE lims_pre.usuarios_id_usuario_seq OWNER TO postgres;

--
-- TOC entry 3689 (class 0 OID 0)
-- Dependencies: 244
-- Name: usuarios_id_usuario_seq; Type: SEQUENCE OWNED BY; Schema: lims_pre; Owner: postgres
--

ALTER SEQUENCE lims_pre.usuarios_id_usuario_seq OWNED BY lims_pre.usuarios.id_usuario;


--
-- TOC entry 252 (class 1259 OID 47245)
-- Name: worklist; Type: TABLE; Schema: lims_pre; Owner: postgres
--

CREATE TABLE lims_pre.worklist (
    id_worklist integer NOT NULL,
    nombre character varying(50),
    create_dt timestamp with time zone NOT NULL,
    delete_dt timestamp with time zone,
    update_dt timestamp with time zone NOT NULL,
    created_by integer,
    updated_by integer,
    tecnica_proc character varying(100)
);


ALTER TABLE lims_pre.worklist OWNER TO postgres;

--
-- TOC entry 253 (class 1259 OID 47248)
-- Name: worklist_id_worklist_seq; Type: SEQUENCE; Schema: lims_pre; Owner: postgres
--

CREATE SEQUENCE lims_pre.worklist_id_worklist_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE lims_pre.worklist_id_worklist_seq OWNER TO postgres;

--
-- TOC entry 3690 (class 0 OID 0)
-- Dependencies: 253
-- Name: worklist_id_worklist_seq; Type: SEQUENCE OWNED BY; Schema: lims_pre; Owner: postgres
--

ALTER SEQUENCE lims_pre.worklist_id_worklist_seq OWNED BY lims_pre.worklist.id_worklist;


/* Tablas para Resultados generados por las máquinas */

-- Tablas RAW para insertar contenido de los ficheros generados sin procesar
-- Su contenido se truncará después de cada Insert a la tabla final

CREATE TABLE res_raw_nanodrop (
	id SERIAL PRIMARY KEY,
	fecha VARCHAR(50),
	sample_code VARCHAR(50),
	an_cant VARCHAR(50),
	a260_280 VARCHAR(50),
	a260_230 VARCHAR(50),
	a260 VARCHAR(50),
	a280 VARCHAR(50),
	an_factor VARCHAR(50),
	correcion_lb VARCHAR(50),
	absorbancia_lb VARCHAR(50),
	corregida VARCHAR(50),
	porc_corregido VARCHAR(50),
	impureza1 VARCHAR(50),
	impureza1_a260 VARCHAR(50),
	impureza1_porc VARCHAR(50),
	impureza1_mm VARCHAR(50),
	impureza2 VARCHAR(50),
	impureza2_a260 VARCHAR(50),
	impureza2_porc VARCHAR(50),
	impureza2_mm VARCHAR(50),
	impureza3 VARCHAR(50),
	impureza3_a260 VARCHAR(50),
	impureza3_porc VARCHAR(50),
	impureza3_mm VARCHAR(50),
	createdAt timestamp DEFAULT CURRENT_TIMESTAMP
);



CREATE TABLE res_raw_qubit (
	id SERIAL PRIMARY KEY,
	run_id VARCHAR(50),
	assay_name VARCHAR(50),
	test_name VARCHAR(50),
	test_date VARCHAR(50),
	qubit_tube_conc VARCHAR(50),
	qubit_units VARCHAR(50),
	orig_conc VARCHAR(50),
	orig_conc_units VARCHAR(50),
	sample_volume_ul VARCHAR(50),
	dilution_factor VARCHAR(50),
	std1_rfu VARCHAR(50),
	std2_rfu VARCHAR(50),
	std3_rfu VARCHAR(50),
	excitation VARCHAR(50),
	emission VARCHAR(50),
	green_rfu VARCHAR(50),
	far_red_rfu VARCHAR(50),
	fecha TIMESTAMP,
	createdAt timestamp DEFAULT CURRENT_TIMESTAMP
);


-- Tablas finales por cada máquina, dando formato
-- La idea es almacenar X días la información que se cargue, controlando con el campo "Procesado"
CREATE TABLE res_final_nanodrop (
	id SERIAL PRIMARY KEY,
	codigo_epi VARCHAR, -- REFERENCES muestra(codigo_epi), --camp sample_code de tabla RAW
	valor_conc_nucleico NUMERIC, --camp an_cant de tabla RAW
	valor_uds VARCHAR DEFAULT 'ng/uL',
    valor_fecha VARCHAR, --camp fecha de tabla RAW
	ratio260_280 NUMERIC, --camp a260_280 de tabla RAW
	ratio260_230 NUMERIC, --camp a260_230 de tabla RAW
	abs_260 NUMERIC, --camp a260 de tabla RAW
	abs_280 NUMERIC, --camp a280 de tabla RAW
	--an_factor NUMERIC,
	--correcion_lb NUMERIC,
	--absorbancia_lb NUMERIC,
	analizador VARCHAR DEFAULT 'NanoDrop',
	procesado BOOLEAN DEFAULT FALSE,
	create_dt timestamp DEFAULT now(),
    update_dt timestamp DEFAULT now(),
    created_by int,
    updated_by int   
);


CREATE TABLE res_final_qubit (
	id SERIAL PRIMARY KEY,
	codigo_epi VARCHAR, -- REFERENCES muestra(codigo_epi), --camp test_name de tabla RAW
	valor VARCHAR, --camp orig_conc de tabla RAW
	valor_uds VARCHAR, --camp orig_conc_units de tabla RAW
	valor_fecha VARCHAR, --camp test_date de tabla RAW 
    tipo_ensayo VARCHAR, --camp assay_name de tabla RAW (dsDNA, RNA, etc.)
	qubit_valor VARCHAR(50), --camp qubit_conc de tabla RAW
	qubit_uds VARCHAR(50), --camp qubit_conc_uds de tabla RAW
	--sample_volume_ul VARCHAR(50),
	--dilution_factor VARCHAR(50),
	analizador VARCHAR DEFAULT 'Qubit',
	procesado BOOLEAN DEFAULT FALSE,
	create_dt timestamp DEFAULT now(),
    update_dt timestamp DEFAULT now(),
    created_by int,
    updated_by int   
);

/* Fin de Tablas para Resultados */



--
-- TOC entry 3367 (class 2604 OID 27754)
-- Name: dim_cat_resultados id; Type: DEFAULT; Schema: lims_pre; Owner: postgres
--

ALTER TABLE ONLY lims_pre.dim_cat_resultados ALTER COLUMN id SET DEFAULT nextval('lims_pre.dim_cat_resultados_id_seq'::regclass);


--
-- TOC entry 3416 (class 2604 OID 47227)
-- Name: dim_centros id; Type: DEFAULT; Schema: lims_pre; Owner: postgres
--

ALTER TABLE ONLY lims_pre.dim_centros ALTER COLUMN id SET DEFAULT nextval('lims_pre.dim_centros_id_seq'::regclass);


--
-- TOC entry 3383 (class 2604 OID 33097)
-- Name: dim_clientes id; Type: DEFAULT; Schema: lims_pre; Owner: postgres
--

ALTER TABLE ONLY lims_pre.dim_clientes ALTER COLUMN id SET DEFAULT nextval('lims_pre.dim_clientes_id_seq'::regclass);


--
-- TOC entry 3418 (class 2604 OID 47237)
-- Name: dim_criterios_validacion id; Type: DEFAULT; Schema: lims_pre; Owner: postgres
--

ALTER TABLE ONLY lims_pre.dim_criterios_validacion ALTER COLUMN id SET DEFAULT nextval('lims_pre.dim_criterios_validacion_id_seq'::regclass);


--
-- TOC entry 3421 (class 2604 OID 49479)
-- Name: dim_estados id; Type: DEFAULT; Schema: lims_pre; Owner: postgres
--

ALTER TABLE ONLY lims_pre.dim_estados ALTER COLUMN id SET DEFAULT nextval('lims_pre.dim_estados_id_seq'::regclass);


--
-- TOC entry 3375 (class 2604 OID 27789)
-- Name: dim_maquinas id; Type: DEFAULT; Schema: lims_pre; Owner: postgres
--

ALTER TABLE ONLY lims_pre.dim_maquinas ALTER COLUMN id SET DEFAULT nextval('lims_pre.dim_maquinas_id_seq'::regclass);


--
-- TOC entry 3411 (class 2604 OID 38850)
-- Name: dim_pacientes id; Type: DEFAULT; Schema: lims_pre; Owner: postgres
--

ALTER TABLE ONLY lims_pre.dim_pacientes ALTER COLUMN id SET DEFAULT nextval('lims_pre.dim_pacientes_id_seq'::regclass);


--
-- TOC entry 3372 (class 2604 OID 27780)
-- Name: dim_pipetas id; Type: DEFAULT; Schema: lims_pre; Owner: postgres
--

ALTER TABLE ONLY lims_pre.dim_pipetas ALTER COLUMN id SET DEFAULT nextval('lims_pre.dim_pipetas_id_seq'::regclass);


--
-- TOC entry 3403 (class 2604 OID 33173)
-- Name: dim_plantilla_tecnica id; Type: DEFAULT; Schema: lims_pre; Owner: postgres
--

ALTER TABLE ONLY lims_pre.dim_plantilla_tecnica ALTER COLUMN id SET DEFAULT nextval('lims_pre.dim_plantilla_tecnica_id_seq'::regclass);


--
-- TOC entry 3389 (class 2604 OID 33110)
-- Name: dim_pruebas id; Type: DEFAULT; Schema: lims_pre; Owner: postgres
--

ALTER TABLE ONLY lims_pre.dim_pruebas ALTER COLUMN id SET DEFAULT nextval('lims_pre.dim_pruebas_id_seq'::regclass);


--
-- TOC entry 3369 (class 2604 OID 27771)
-- Name: dim_reactivos id; Type: DEFAULT; Schema: lims_pre; Owner: postgres
--

ALTER TABLE ONLY lims_pre.dim_reactivos ALTER COLUMN id SET DEFAULT nextval('lims_pre.dim_reactivos_id_seq'::regclass);


--
-- TOC entry 3405 (class 2604 OID 33181)
-- Name: dim_tecnicas_proc id; Type: DEFAULT; Schema: lims_pre; Owner: postgres
--

ALTER TABLE ONLY lims_pre.dim_tecnicas_proc ALTER COLUMN id SET DEFAULT nextval('lims_pre.dim_tecnicas_proc_id_seq'::regclass);


--
-- TOC entry 3365 (class 2604 OID 27727)
-- Name: dim_tipo_muestra id; Type: DEFAULT; Schema: lims_pre; Owner: postgres
--

ALTER TABLE ONLY lims_pre.dim_tipo_muestra ALTER COLUMN id SET DEFAULT nextval('lims_pre.dim_tipo_muestra_id_seq'::regclass);


--
-- TOC entry 3381 (class 2604 OID 27967)
-- Name: dim_ubicacion id; Type: DEFAULT; Schema: lims_pre; Owner: postgres
--

ALTER TABLE ONLY lims_pre.dim_ubicacion ALTER COLUMN id SET DEFAULT nextval('lims_pre.dim_ubicacion_id_seq'::regclass);


--
-- TOC entry 3395 (class 2604 OID 33138)
-- Name: muestra id_muestra; Type: DEFAULT; Schema: lims_pre; Owner: postgres
--

ALTER TABLE ONLY lims_pre.muestra ALTER COLUMN id_muestra SET DEFAULT nextval('lims_pre.muestra_id_muestra_seq'::regclass);


--
-- TOC entry 3360 (class 2604 OID 27700)
-- Name: muestra_array id_array; Type: DEFAULT; Schema: lims_pre; Owner: postgres
--

ALTER TABLE ONLY lims_pre.muestra_array ALTER COLUMN id_array SET DEFAULT nextval('lims_pre.muestra_array_id_array_seq'::regclass);


--
-- TOC entry 3378 (class 2604 OID 27959)
-- Name: muestra_ubicacion id_muestra_ubic; Type: DEFAULT; Schema: lims_pre; Owner: postgres
--

ALTER TABLE ONLY lims_pre.muestra_ubicacion ALTER COLUMN id_muestra_ubic SET DEFAULT nextval('lims_pre.muestra_ubicacion_id_muestra_ubic_seq'::regclass);


--
-- TOC entry 3363 (class 2604 OID 27717)
-- Name: resultado id_resultado; Type: DEFAULT; Schema: lims_pre; Owner: postgres
--

ALTER TABLE ONLY lims_pre.resultado ALTER COLUMN id_resultado SET DEFAULT nextval('lims_pre.resultado_id_resultado_seq'::regclass);


--
-- TOC entry 3408 (class 2604 OID 33200)
-- Name: roles id_rol; Type: DEFAULT; Schema: lims_pre; Owner: postgres
--

ALTER TABLE ONLY lims_pre.roles ALTER COLUMN id_rol SET DEFAULT nextval('lims_pre.roles_id_rol_seq'::regclass);


--
-- TOC entry 3392 (class 2604 OID 33119)
-- Name: solicitud id_solicitud; Type: DEFAULT; Schema: lims_pre; Owner: postgres
--

ALTER TABLE ONLY lims_pre.solicitud ALTER COLUMN id_solicitud SET DEFAULT nextval('lims_pre.solicitud_id_solicitud_seq'::regclass);


--
-- TOC entry 3400 (class 2604 OID 33159)
-- Name: tecnicas id_tecnica; Type: DEFAULT; Schema: lims_pre; Owner: postgres
--

ALTER TABLE ONLY lims_pre.tecnicas ALTER COLUMN id_tecnica SET DEFAULT nextval('lims_pre.tecnicas_id_tecnica_seq'::regclass);


--
-- TOC entry 3409 (class 2604 OID 33209)
-- Name: usuarios id_usuario; Type: DEFAULT; Schema: lims_pre; Owner: postgres
--

ALTER TABLE ONLY lims_pre.usuarios ALTER COLUMN id_usuario SET DEFAULT nextval('lims_pre.usuarios_id_usuario_seq'::regclass);


--
-- TOC entry 3420 (class 2604 OID 47249)
-- Name: worklist id_worklist; Type: DEFAULT; Schema: lims_pre; Owner: postgres
--

ALTER TABLE ONLY lims_pre.worklist ALTER COLUMN id_worklist SET DEFAULT nextval('lims_pre.worklist_id_worklist_seq'::regclass);


--
-- TOC entry 3624 (class 0 OID 27751)
-- Dependencies: 217
-- Data for Name: dim_cat_resultados; Type: TABLE DATA; Schema: lims_pre; Owner: postgres
--



--
-- TOC entry 3655 (class 0 OID 47221)
-- Dependencies: 248
-- Data for Name: dim_centros; Type: TABLE DATA; Schema: lims_pre; Owner: postgres
--

INSERT INTO lims_pre.dim_centros VALUES (1, '001', 'HOSPITAL LA FE', 1, '2025-08-18 10:41:26.494706');
INSERT INTO lims_pre.dim_centros VALUES (3, '003', 'CLINICA VIRGEN DEL CONSUELO', 1, '2025-08-18 10:41:26.494706');
INSERT INTO lims_pre.dim_centros VALUES (4, '004', 'CLINICA DR ANDREU', 1, '2025-08-18 10:41:26.494706');
INSERT INTO lims_pre.dim_centros VALUES (5, 'ALC_012', 'VISTAHERMOSA', NULL, '2025-10-06 09:30:08.152');
INSERT INTO lims_pre.dim_centros VALUES (6, '8207', 'CENTRO GENERAL ALICANTE', NULL, '2025-10-06 09:30:23.943');
INSERT INTO lims_pre.dim_centros VALUES (2, '002', 'HOSPITAL CLINICO UNIVERSITARIO VALENCIA', 1, '2025-10-06 09:33:05.062');


--
-- TOC entry 3636 (class 0 OID 33094)
-- Dependencies: 229
-- Data for Name: dim_clientes; Type: TABLE DATA; Schema: lims_pre; Owner: postgres
--

INSERT INTO lims_pre.dim_clientes VALUES (2, 'INCLIVA', 'INCLIVA', '66554477', 'Hospital Clínico', true, 2, '2025-05-02 09:50:00+02', NULL);
INSERT INTO lims_pre.dim_clientes VALUES (3, 'LA FE', 'LA FE', '44775588', 'La Fe', true, 2, '2025-05-02 09:50:00+02', NULL);
INSERT INTO lims_pre.dim_clientes VALUES (4, 'Antonio Perez', 'Laboratorio Mendez', '123456', 'La calle de Antonio', true, NULL, '2025-10-06 12:10:35.89+02', NULL);
INSERT INTO lims_pre.dim_clientes VALUES (1, 'Cliente número 1', 'Razón cliente', '11223344', 'Calle del cliente', true, 1, '2025-10-06 12:10:52.39+02', '2025-10-06 12:10:52.39+02');


--
-- TOC entry 3657 (class 0 OID 47233)
-- Dependencies: 250
-- Data for Name: dim_criterios_validacion; Type: TABLE DATA; Schema: lims_pre; Owner: postgres
--

INSERT INTO lims_pre.dim_criterios_validacion VALUES (1, 'AZ001', 'CRITERIO PRIMARIO', NULL, '2025-08-18 10:42:48.832991');
INSERT INTO lims_pre.dim_criterios_validacion VALUES (2, 'AZ002', 'CRITERIO SECUNDARIO', NULL, '2025-08-18 10:42:48.832991');
INSERT INTO lims_pre.dim_criterios_validacion VALUES (3, 'EB23', 'PROTOCOLO ESTRICTO', NULL, '2025-08-18 10:42:48.832991');


--
-- TOC entry 3662 (class 0 OID 49476)
-- Dependencies: 255
-- Data for Name: dim_estados; Type: TABLE DATA; Schema: lims_pre; Owner: postgres
--

INSERT INTO lims_pre.dim_estados VALUES (1, 'REGISTRADA', 'MUESTRA', 'Muestra registrada en el sistema', 1, true, '#e3f2fd', true, false);
INSERT INTO lims_pre.dim_estados VALUES (2, 'RECIBIDA', 'MUESTRA', 'Muestra recibida en laboratorio', 2, true, '#fff3e0', false, false);
INSERT INTO lims_pre.dim_estados VALUES (3, 'EN_PROCESO', 'MUESTRA', 'Muestra en proceso de análisis', 3, true, '#f3e5f5', false, false);
INSERT INTO lims_pre.dim_estados VALUES (4, 'COMPLETADA', 'MUESTRA', 'Análisis de muestra completado', 4, true, '#e8f5e8', false, true);
INSERT INTO lims_pre.dim_estados VALUES (5, 'RECHAZADA', 'MUESTRA', 'Muestra rechazada por criterios de calidad', 99, true, '#ffebee', false, true);
INSERT INTO lims_pre.dim_estados VALUES (6, 'EN_REVISION', 'MUESTRA', 'Muestra en proceso de revisión', 5, true, '#f9fbe7', false, false);
INSERT INTO lims_pre.dim_estados VALUES (7, 'DEVUELTA', 'MUESTRA', 'Muestra devuelta al cliente', 98, true, '#fce4ec', false, true);
INSERT INTO lims_pre.dim_estados VALUES (8, 'PENDIENTE', 'TECNICA', 'Técnica pendiente de ejecución', 1, true, '#e8eaf6', true, false);
INSERT INTO lims_pre.dim_estados VALUES (9, 'ASIGNADA', 'TECNICA', 'Técnica asignada a técnico responsable', 2, true, '#e1f5fe', false, false);
INSERT INTO lims_pre.dim_estados VALUES (10, 'EN_PROCESO', 'TECNICA', 'Técnica en proceso de ejecución', 3, true, '#fff3e0', false, false);
INSERT INTO lims_pre.dim_estados VALUES (11, 'EN_REVISION', 'TECNICA', 'Técnica en proceso de revisión', 4, true, '#f3e5f5', false, false);
INSERT INTO lims_pre.dim_estados VALUES (12, 'COMPLETADA_TECNICA', 'TECNICA', 'Técnica completada exitosamente', 5, true, '#e8f5e8', false, true);
INSERT INTO lims_pre.dim_estados VALUES (13, 'CANCELADA_TECNICA', 'TECNICA', 'Técnica cancelada', 99, true, '#ffebee', false, true);
INSERT INTO lims_pre.dim_estados VALUES (14, 'PAUSADA', 'TECNICA', 'Técnica pausada temporalmente', 10, true, '#fff8e1', false, false);
INSERT INTO lims_pre.dim_estados VALUES (15, 'REINTENTANDO', 'TECNICA', 'Técnica reintentando después de fallo', 11, true, '#fce4ec', false, false);


--
-- TOC entry 3630 (class 0 OID 27786)
-- Dependencies: 223
-- Data for Name: dim_maquinas; Type: TABLE DATA; Schema: lims_pre; Owner: postgres
--

INSERT INTO lims_pre.dim_maquinas VALUES (1, '01', 'SimplyAmp (Applied Biosystems) ', '95ºC- 1min + 30 x (95ºC-15s + 52 ºC-15s + 72ºC-10s)', true, 2, '2025-05-19 18:35:34.959048', 1);
INSERT INTO lims_pre.dim_maquinas VALUES (2, '02', 'QS5 - Código: S.TC3', '', true, 2, '2025-05-19 18:35:34.96352', 2);
INSERT INTO lims_pre.dim_maquinas VALUES (3, '03', 'QS5 - Código: S.TC3', 'Genotipado TaqMan SNPs.edt.  60ºC-30 segundos + 95ºC-10 minutos + 40 x ( 95º-15 segundos + 60ºC-1 minuto) + 60ºC-30 segundos', true, 2, '2025-05-19 18:35:34.966047', 3);
INSERT INTO lims_pre.dim_maquinas VALUES (4, '04', 'SimplyAmp (Applied Biosystems) ', 'SensiFAST cDNA', true, 2, '2025-05-19 18:35:34.968578', 2);
INSERT INTO lims_pre.dim_maquinas VALUES (5, '05', 'LyghtCycler 480 II', 'Roche 2 steps (amplificación 1 minuto)', true, 2, '2025-05-19 18:35:34.971318', 4);
INSERT INTO lims_pre.dim_maquinas VALUES (6, '06', 'SimplyAmp (Applied Biosystems) ', '', true, 2, '2025-05-19 18:35:34.973595', 5);
INSERT INTO lims_pre.dim_maquinas VALUES (7, '07', 'LyghtCycler 480 II', '', true, 2, '2025-05-19 18:35:34.97585', 6);
INSERT INTO lims_pre.dim_maquinas VALUES (9, '09', 'QS5 - Código: S.TC3', '', true, 2, '2025-05-19 18:35:34.979974', 5);
INSERT INTO lims_pre.dim_maquinas VALUES (8, '08', 'LyghtCycler 480 II', '', true, 2, '2025-10-06 11:06:51.106', 6);


--
-- TOC entry 3654 (class 0 OID 38847)
-- Dependencies: 247
-- Data for Name: dim_pacientes; Type: TABLE DATA; Schema: lims_pre; Owner: postgres
--

INSERT INTO lims_pre.dim_pacientes VALUES (1, 'Paciente Uno Uno', '11223344', 'Calle del paciente', true, 2, '2025-05-07 11:00:00+02', NULL);
INSERT INTO lims_pre.dim_pacientes VALUES (2, 'Paco Ribes Frones', '55555555', 'Calle del perol', true, 2, '2025-05-07 11:00:00+02', NULL);
INSERT INTO lims_pre.dim_pacientes VALUES (3, 'Pepe Don Jose', '11221122', 'Calle del mos', true, 1, '2025-05-07 11:00:00+02', NULL);
INSERT INTO lims_pre.dim_pacientes VALUES (4, 'RAFA', '89745615', 'Mi casa aaa', true, NULL, '2025-10-06 13:06:23.591+02', '2025-10-06 13:06:23.591+02');


--
-- TOC entry 3628 (class 0 OID 27777)
-- Dependencies: 221
-- Data for Name: dim_pipetas; Type: TABLE DATA; Schema: lims_pre; Owner: postgres
--

INSERT INTO lims_pre.dim_pipetas VALUES (2, 'F.PM8', 'Pipeta monocanal ThermoFisher 0,2-2 µl', 'Lab 9- F.CFL2', true, 1, '2025-04-14 11:41:07.308886', 16);
INSERT INTO lims_pre.dim_pipetas VALUES (3, 'S.PM18', 'Pipeta monocanal ThermoFisher 100-1000 µl', 'Lab 10- Zona Post-amp', true, 1, '2025-04-14 11:41:07.308886', 16);
INSERT INTO lims_pre.dim_pipetas VALUES (4, 'S.PM16', 'Pipeta monocanal ThermoFisher 2-20 µl', 'Lab 10- Zona Post-amp', true, 1, '2025-04-14 11:41:07.308886', 16);
INSERT INTO lims_pre.dim_pipetas VALUES (5, 'S.PM2', 'Pipeta monocanal ThermoFisher 2-20 µl', 'Lab P2- S.CFL1', true, 1, '2025-04-14 11:41:07.308886', 16);
INSERT INTO lims_pre.dim_pipetas VALUES (6, 'S.PM3', 'Pipeta monocanal ThermoFisher 20-200 µl', 'Lab P2- S.CFL1', true, 1, '2025-04-14 11:41:07.308886', 16);
INSERT INTO lims_pre.dim_pipetas VALUES (7, 'S.PMO6', 'Pipeta electrónica E4 mult.E12-20XLS+ Mettler Toledo', 'Lab P2- S.CFL1', true, 1, '2025-04-14 11:41:07.308886', 16);
INSERT INTO lims_pre.dim_pipetas VALUES (8, 'S.PMC4', 'Pipeta multicanal ThermoFisher F2 1-10 uL', 'Lab P2- S.CFL1', true, 1, '2025-04-14 11:41:07.308886', 16);
INSERT INTO lims_pre.dim_pipetas VALUES (9, 'F.PM7', 'Pipeta monocanal ThermoFisher 2-20 µl', 'Lab 9- F.CFL2', true, 1, '2025-04-14 11:41:07.308886', 16);
INSERT INTO lims_pre.dim_pipetas VALUES (10, 'F.PM6', 'Pipeta monocanal ThermoFisher 20-200 µl', 'Lab 9- F.CFL2', true, 1, '2025-04-14 11:41:07.308886', 16);
INSERT INTO lims_pre.dim_pipetas VALUES (11, 'S.PM9', 'Pipeta monocanal ThermoFisher 0,5-2 µl', 'Lab 10- F.CFL1', true, 1, '2025-04-14 11:41:07.308886', 16);
INSERT INTO lims_pre.dim_pipetas VALUES (12, 'F.PM6', 'Pipeta monocanal ThermoFisher 20-200 µl', 'Lab 9- F.CFL2', true, 1, '2025-04-14 11:41:07.308886', 16);
INSERT INTO lims_pre.dim_pipetas VALUES (13, 'S.PMC1', 'Pipeta multicanal ThermoFisher F1 1-10 µl', 'Lab 10- F.CFL1', true, 1, '2025-04-14 11:41:07.308886', 16);
INSERT INTO lims_pre.dim_pipetas VALUES (14, 'S.PMO2', 'Pipeta Rainin electrónica E4 XLS 10-100 µl', 'Lab 10- F.CFL1', true, 1, '2025-04-14 11:41:07.308886', 16);
INSERT INTO lims_pre.dim_pipetas VALUES (15, 'S.PM13', 'Pipeta monocanal JetPiP 0,1-2,5ul', 'POST-AMP', true, 1, '2025-04-14 11:41:07.308886', 6);
INSERT INTO lims_pre.dim_pipetas VALUES (16, 'S.PM18', 'Pipeta monocanal ThermoFisher 100-1000 µl', 'POST-AMP', true, 1, '2025-04-14 11:41:07.308886', 6);
INSERT INTO lims_pre.dim_pipetas VALUES (17, 'S.PM17', 'Pipeta monocanal ThermoFisher 20-200 µl', 'POST-AMP', true, 1, '2025-04-14 11:41:07.308886', 6);
INSERT INTO lims_pre.dim_pipetas VALUES (18, 'S.PM16', 'Pipeta monocanal ThermoFisher 2-20 µl', 'POST-AMP', true, 1, '2025-04-14 11:41:07.308886', 6);
INSERT INTO lims_pre.dim_pipetas VALUES (19, 'S.PM15', 'Pipeta monocanal JetPiP 0,5-10 µl', 'POST-AMP', true, 1, '2025-04-14 11:41:07.308886', 6);
INSERT INTO lims_pre.dim_pipetas VALUES (20, 'S.PM19', 'Pipeta monocanal ThermoFisher F2 2-20 uL', 'Lab P2-SCS2', true, 1, '2025-04-14 11:41:07.308886', 8);
INSERT INTO lims_pre.dim_pipetas VALUES (21, 'S.PM5', 'Pipeta monocanal ThermoFisher F1 10-100 uL', 'Lab P2-SCS2', true, 1, '2025-04-14 11:41:07.308886', 8);
INSERT INTO lims_pre.dim_pipetas VALUES (22, 'S.PM21', 'Pipeta monocanal ThermoFisher F2 100-1000 uL', 'Lab P2-SCS2', true, 1, '2025-04-14 11:41:07.308886', 8);
INSERT INTO lims_pre.dim_pipetas VALUES (23, 'S.PM16', 'Pipeta monocanal ThermoFisher 2-20 µl', 'POST-AMP', true, 1, '2025-04-14 11:41:07.308886', 9);
INSERT INTO lims_pre.dim_pipetas VALUES (24, 'S.PM15', 'Pipeta monocanal JetPiP 0,5-10 µl', 'POST-AMP', true, 1, '2025-04-14 11:41:07.308886', 9);
INSERT INTO lims_pre.dim_pipetas VALUES (25, 'S.PM21', 'Pipeta monocanal ThermoFisher 100-1000 µl', 'Lab P2- SCS2', true, 1, '2025-04-14 11:41:07.308886', 10);
INSERT INTO lims_pre.dim_pipetas VALUES (26, 'S.PM5', 'Pipeta monocanal ThermoFisher 10-100 µl', 'Lab P2- SCS2', true, 1, '2025-04-14 11:41:07.308886', 10);
INSERT INTO lims_pre.dim_pipetas VALUES (27, 'S.PM19', 'Pipeta monocanal ThermoFisher 2-20 µl', 'Lab P2- SCS2', true, 1, '2025-04-14 11:41:07.308886', 10);
INSERT INTO lims_pre.dim_pipetas VALUES (28, 'S.PM13', 'Pipeta monocanal JetPiP 0,1-2,5 µl', 'Lab P2- SCS2', true, 1, '2025-04-14 11:41:07.308886', 10);
INSERT INTO lims_pre.dim_pipetas VALUES (29, 'S.PM21', 'Pipeta monocanal Finnpipette F2 100-1000 µl', 'Lab P2- SCS2', true, 1, '2025-04-14 11:41:07.308886', 11);
INSERT INTO lims_pre.dim_pipetas VALUES (30, 'S.PM5', 'Pipeta monocanal Finnpipette F110-100 µl', 'Lab P2- SCS2', true, 1, '2025-04-14 11:41:07.308886', 11);
INSERT INTO lims_pre.dim_pipetas VALUES (31, 'S.PM19', 'Pipeta monocanal Finnpipette F2 2-20 µl', 'Lab P2- SCS2', true, 1, '2025-04-14 11:41:07.308886', 11);
INSERT INTO lims_pre.dim_pipetas VALUES (32, 'S.PM15', 'Pipeta monocanal JetPiP 0,5-10 µl', 'Lab P2- SCS2', true, 1, '2025-04-14 11:41:07.308886', 11);
INSERT INTO lims_pre.dim_pipetas VALUES (33, 'S.PM21', 'Pipeta monocanal Finnpipette F2 100-1000 µl', 'Lab 10- SCG1', true, 1, '2025-04-14 11:41:07.308886', 12);
INSERT INTO lims_pre.dim_pipetas VALUES (34, 'S.PM5', 'Pipeta monocanal Finnpipette F110-100 µl', 'Lab 10- SCG1', true, 1, '2025-04-14 11:41:07.308886', 12);
INSERT INTO lims_pre.dim_pipetas VALUES (35, 'S.PM19', 'Pipeta monocanal Finnpipette F2 2-20 µl', 'Lab 10- SCG1', true, 1, '2025-04-14 11:41:07.308886', 12);
INSERT INTO lims_pre.dim_pipetas VALUES (36, 'S.PM13', 'Pipeta monocanal JetPiP 0,1-2,5 µl', 'Lab 10- SCG1', true, 1, '2025-04-14 11:41:07.308886', 12);
INSERT INTO lims_pre.dim_pipetas VALUES (37, 'S.PM21', 'Pipeta monocanal Finnpipette F2 100-1000 µl', 'Lab P2- SCS2', true, 1, '2025-04-14 11:41:07.308886', 13);
INSERT INTO lims_pre.dim_pipetas VALUES (38, 'S.PM5', 'Pipeta monocanal Finnpipette F110-100 µl', 'Lab P2- SCS2', true, 1, '2025-04-14 11:41:07.308886', 13);
INSERT INTO lims_pre.dim_pipetas VALUES (39, 'S.PM19', 'Pipeta monocanal Finnpipette F2 2-20 µl', 'Lab P2- SCS2', true, 1, '2025-04-14 11:41:07.308886', 13);
INSERT INTO lims_pre.dim_pipetas VALUES (40, 'S.PM13', 'Pipeta monocanal JetPiP 0,1-2,5 µl', 'Lab P2- SCS2', true, 1, '2025-04-14 11:41:07.308886', 13);
INSERT INTO lims_pre.dim_pipetas VALUES (41, 'S.PM15', 'Pipeta monocanal JetPiP 0,5-10ul', 'POST-AMP', true, 1, '2025-04-14 11:41:07.308886', 14);
INSERT INTO lims_pre.dim_pipetas VALUES (1, 'F.PM7', 'Pipeta monocanal ThermoFisher 2-20 µl', 'Lab 9- F.CFL2', true, 1, '2025-10-06 11:07:17.988', 16);


--
-- TOC entry 3646 (class 0 OID 33170)
-- Dependencies: 239
-- Data for Name: dim_plantilla_tecnica; Type: TABLE DATA; Schema: lims_pre; Owner: postgres
--

INSERT INTO lims_pre.dim_plantilla_tecnica VALUES (1, 'IE.T.016.P1.E1', 'PCR Convencional', true, 1, '2025-05-04 10:00:00+02');
INSERT INTO lims_pre.dim_plantilla_tecnica VALUES (2, 'PurPCR.P1.E1', 'Purificación producto de PCR', true, 1, '2025-05-04 10:00:00+02');
INSERT INTO lims_pre.dim_plantilla_tecnica VALUES (3, 'PCRSGEN.P1.E4', 'Genotipado por PCR', true, 1, '2025-05-04 10:00:00+02');
INSERT INTO lims_pre.dim_plantilla_tecnica VALUES (4, 'ScoliM.P1.E1', 'RT ScoliMIR L2400XX', true, 1, '2025-05-04 10:00:00+02');
INSERT INTO lims_pre.dim_plantilla_tecnica VALUES (5, 'ScoliM.P2.E1', 'PCR a tiempo real ScoliMIR', true, 1, '2025-05-04 10:00:00+02');
INSERT INTO lims_pre.dim_plantilla_tecnica VALUES (6, 'CuNano.P1.E1', 'Cuantificación Ácidos Nucleicos con Nanodrop', true, 1, '2025-05-04 10:00:00+02');
INSERT INTO lims_pre.dim_plantilla_tecnica VALUES (7, 'CuQub.P1.E2', 'Cuantificación Qubit', true, 1, '2025-05-04 10:00:00+02');
INSERT INTO lims_pre.dim_plantilla_tecnica VALUES (8, 'Dilu.P1.E2', 'Diluciones ácidos nucleicos', true, 1, '2025-05-04 10:00:00+02');
INSERT INTO lims_pre.dim_plantilla_tecnica VALUES (9, 'EleDNA.P1.E2', 'Electroforesis', true, 1, '2025-05-04 10:00:00+02');
INSERT INTO lims_pre.dim_plantilla_tecnica VALUES (10, 'ExDNA.P1.E2', 'Extracción Robot Chemagic', true, 1, '2025-05-04 10:00:00+02');
INSERT INTO lims_pre.dim_plantilla_tecnica VALUES (11, 'ExmiRQ.P1.E1', 'Extracción DNA QIAamp DNA mini Kit', true, 1, '2025-05-04 10:00:00+02');
INSERT INTO lims_pre.dim_plantilla_tecnica VALUES (12, 'ExmiRQ.P1.E3', 'Extracción miRNAs', true, 1, '2025-05-04 10:00:00+02');
INSERT INTO lims_pre.dim_plantilla_tecnica VALUES (13, 'ExmiRV.P1.E1', 'Extracción mirVana', true, 1, '2025-05-04 10:00:00+02');
INSERT INTO lims_pre.dim_plantilla_tecnica VALUES (14, 'HemNano.P1.E2', 'Medición grado hemólisis en plasma con Nanodrop One', true, 1, '2025-05-04 10:00:00+02');
INSERT INTO lims_pre.dim_plantilla_tecnica VALUES (15, 'IE.T.012.R1.E2', 'RT', true, 1, '2025-05-04 10:00:00+02');
INSERT INTO lims_pre.dim_plantilla_tecnica VALUES (16, 'IE.T.012.R2.E2', 'PCR a tiempo real', true, 1, '2025-05-04 10:00:00+02');


--
-- TOC entry 3638 (class 0 OID 33107)
-- Dependencies: 231
-- Data for Name: dim_pruebas; Type: TABLE DATA; Schema: lims_pre; Owner: postgres
--

INSERT INTO lims_pre.dim_pruebas VALUES (1, 'SG', 'ScoliGEN', true, 1, '2025-05-02 09:50:00+02');
INSERT INTO lims_pre.dim_pruebas VALUES (2, 'AM', 'AgingMETRIX', true, 1, '2025-05-02 09:50:00+02');
INSERT INTO lims_pre.dim_pruebas VALUES (3, 'ArrGEx', 'ArraysGEN_EX', true, 1, '2025-05-02 09:50:00+02');
INSERT INTO lims_pre.dim_pruebas VALUES (4, 'ArrGGsa', 'ArraysGEN_GSAv3', true, 1, '2025-05-02 09:50:00+02');
INSERT INTO lims_pre.dim_pruebas VALUES (5, 'ArrMEpic', 'ArraysMET_EPICv2', true, 1, '2025-05-02 09:50:00+02');
INSERT INTO lims_pre.dim_pruebas VALUES (6, 'ArrMEx', 'ArraysMET_EX', true, 1, '2025-05-02 09:50:00+02');


--
-- TOC entry 3626 (class 0 OID 27768)
-- Dependencies: 219
-- Data for Name: dim_reactivos; Type: TABLE DATA; Schema: lims_pre; Owner: postgres
--



--
-- TOC entry 3648 (class 0 OID 33178)
-- Dependencies: 241
-- Data for Name: dim_tecnicas_proc; Type: TABLE DATA; Schema: lims_pre; Owner: postgres
--

INSERT INTO lims_pre.dim_tecnicas_proc VALUES (2, 'Cuantificación DNA Nanodrop', 2, true, true, 1, '2025-05-04 22:09:14.371572+02', 1, 6);
INSERT INTO lims_pre.dim_tecnicas_proc VALUES (3, 'Dilución DNA 5 ng/uL en 50uL', 3, true, true, 1, '2025-05-04 22:09:14.371572+02', 1, 8);
INSERT INTO lims_pre.dim_tecnicas_proc VALUES (4, 'Genotipado qPCR ScoliGEN', 4, true, true, 1, '2025-05-04 22:09:14.371572+02', 1, 3);
INSERT INTO lims_pre.dim_tecnicas_proc VALUES (5, 'Análisis resultados genotipado ScoliGEN', 5, true, true, 1, '2025-05-04 22:09:14.371572+02', 1, NULL);
INSERT INTO lims_pre.dim_tecnicas_proc VALUES (6, 'Análisis bioinformático ScoliGEN', 6, true, true, 1, '2025-05-04 22:09:14.371572+02', 1, NULL);
INSERT INTO lims_pre.dim_tecnicas_proc VALUES (7, 'Elaboración informe ScoliGEN', 7, true, true, 1, '2025-05-04 22:09:14.371572+02', 1, NULL);
INSERT INTO lims_pre.dim_tecnicas_proc VALUES (8, 'Validación informe ScoliGEN', 8, true, true, 1, '2025-05-04 22:09:14.371572+02', 1, NULL);
INSERT INTO lims_pre.dim_tecnicas_proc VALUES (9, 'Envío resultados a cliente', 9, true, true, 1, '2025-05-04 22:09:14.371572+02', 1, NULL);
INSERT INTO lims_pre.dim_tecnicas_proc VALUES (10, 'Extracción ADN saliva/sangre', 1, true, true, 1, '2025-05-04 22:09:14.371572+02', 2, 10);
INSERT INTO lims_pre.dim_tecnicas_proc VALUES (11, 'Cuantificación Qubit', 2, true, true, 1, '2025-05-04 22:09:14.371572+02', 2, 7);
INSERT INTO lims_pre.dim_tecnicas_proc VALUES (22, 'Envío resultados a cliente', 13, true, true, 1, '2025-05-04 22:10:20.554209+02', 2, NULL);
INSERT INTO lims_pre.dim_tecnicas_proc VALUES (12, 'Dilución DNA 12ng/uL en 45uL', 3, true, true, 1, '2025-05-04 22:10:50.150326+02', 2, 8);
INSERT INTO lims_pre.dim_tecnicas_proc VALUES (13, 'Conversión Bisulfito', 4, true, true, 1, '2025-05-04 22:10:50.150326+02', 2, NULL);
INSERT INTO lims_pre.dim_tecnicas_proc VALUES (14, 'PCR1 AgingMETRIX', 5, true, true, 1, '2025-05-04 22:10:50.150326+02', 2, 1);
INSERT INTO lims_pre.dim_tecnicas_proc VALUES (15, 'PCR2 AgingMETRIX', 6, true, true, 1, '2025-05-04 22:10:50.150326+02', 2, 1);
INSERT INTO lims_pre.dim_tecnicas_proc VALUES (16, 'Purificación producto PCR2', 7, true, true, 1, '2025-05-04 22:10:50.150326+02', 2, NULL);
INSERT INTO lims_pre.dim_tecnicas_proc VALUES (17, 'Cuantificación producto final', 8, true, true, 1, '2025-05-04 22:10:50.150326+02', 2, NULL);
INSERT INTO lims_pre.dim_tecnicas_proc VALUES (18, 'Lectura en MiSeq', 9, true, true, 1, '2025-05-04 22:10:50.150326+02', 2, NULL);
INSERT INTO lims_pre.dim_tecnicas_proc VALUES (19, 'Análisis bioinformático AgingMETRIX', 10, true, true, 1, '2025-05-04 22:10:50.150326+02', 2, NULL);
INSERT INTO lims_pre.dim_tecnicas_proc VALUES (20, 'Elaboración informe AgingMETRIX', 11, true, true, 1, '2025-05-04 22:10:50.150326+02', 2, NULL);
INSERT INTO lims_pre.dim_tecnicas_proc VALUES (21, 'Validación informe AgingMETRIX', 12, true, true, 1, '2025-05-04 22:10:50.150326+02', 2, NULL);
INSERT INTO lims_pre.dim_tecnicas_proc VALUES (23, 'Extracción ADN saliva/sangre', 1, true, true, 1, '2025-05-04 22:11:32.514819+02', 3, 10);
INSERT INTO lims_pre.dim_tecnicas_proc VALUES (24, 'Cuantificación Qubit', 2, true, true, 1, '2025-05-04 22:11:32.514819+02', 3, 7);
INSERT INTO lims_pre.dim_tecnicas_proc VALUES (25, 'Dilución DNA 12ng/uL en 45uL', 3, true, true, 1, '2025-05-04 22:11:32.514819+02', 3, 8);
INSERT INTO lims_pre.dim_tecnicas_proc VALUES (26, 'Conversión Bisulfito', 4, true, true, 1, '2025-05-04 22:11:32.514819+02', 3, NULL);
INSERT INTO lims_pre.dim_tecnicas_proc VALUES (27, 'PCR1 AgingGEN', 5, true, true, 1, '2025-05-04 22:11:32.514819+02', 3, 2);
INSERT INTO lims_pre.dim_tecnicas_proc VALUES (28, 'PCR2 AgingGEN', 6, true, true, 1, '2025-05-04 22:11:32.514819+02', 3, 2);
INSERT INTO lims_pre.dim_tecnicas_proc VALUES (29, 'Purificación producto PCR2', 7, true, true, 1, '2025-05-04 22:11:32.514819+02', 3, NULL);
INSERT INTO lims_pre.dim_tecnicas_proc VALUES (30, 'Cuantificación producto final', 8, true, true, 1, '2025-05-04 22:11:32.514819+02', 3, NULL);
INSERT INTO lims_pre.dim_tecnicas_proc VALUES (31, 'Lectura en MiSeq', 9, true, true, 1, '2025-05-04 22:11:32.514819+02', 3, NULL);
INSERT INTO lims_pre.dim_tecnicas_proc VALUES (32, 'Análisis bioinformático AgingGEN', 10, true, true, 1, '2025-05-04 22:11:32.514819+02', 3, NULL);
INSERT INTO lims_pre.dim_tecnicas_proc VALUES (33, 'Elaboración informe AgingGEN', 11, true, true, 1, '2025-05-04 22:11:32.514819+02', 3, NULL);
INSERT INTO lims_pre.dim_tecnicas_proc VALUES (34, 'Validación informe AgingGEN', 12, true, true, 1, '2025-05-04 22:11:48.211288+02', 3, NULL);
INSERT INTO lims_pre.dim_tecnicas_proc VALUES (35, 'Envío resultados a cliente', 13, true, true, 1, '2025-05-04 22:11:48.211288+02', 3, NULL);
INSERT INTO lims_pre.dim_tecnicas_proc VALUES (36, 'Extracción ADN saliva/sangre', 1, true, true, 1, '2025-05-04 22:11:48.211288+02', 4, 10);
INSERT INTO lims_pre.dim_tecnicas_proc VALUES (37, 'Cuantificación Qubit', 2, true, true, 1, '2025-05-04 22:11:48.211288+02', 4, 7);
INSERT INTO lims_pre.dim_tecnicas_proc VALUES (38, 'Dilución DNA 12ng/uL en 45uL', 3, true, true, 1, '2025-05-04 22:11:48.211288+02', 4, 8);
INSERT INTO lims_pre.dim_tecnicas_proc VALUES (39, 'Conversión Bisulfito', 4, true, true, 1, '2025-05-04 22:11:48.211288+02', 4, NULL);
INSERT INTO lims_pre.dim_tecnicas_proc VALUES (40, 'PCR1 AgingSKIN', 5, true, true, 1, '2025-05-04 22:11:48.211288+02', 4, 5);
INSERT INTO lims_pre.dim_tecnicas_proc VALUES (41, 'PCR2 AgingSKIN', 6, true, true, 1, '2025-05-04 22:11:48.211288+02', 4, 5);
INSERT INTO lims_pre.dim_tecnicas_proc VALUES (42, 'Purificación producto PCR2', 7, true, true, 1, '2025-05-04 22:11:48.211288+02', 4, NULL);
INSERT INTO lims_pre.dim_tecnicas_proc VALUES (43, 'Cuantificación producto final', 8, true, true, 1, '2025-05-04 22:11:48.211288+02', 4, NULL);
INSERT INTO lims_pre.dim_tecnicas_proc VALUES (44, 'Lectura en MiSeq', 9, true, true, 1, '2025-05-04 22:11:48.211288+02', 4, NULL);
INSERT INTO lims_pre.dim_tecnicas_proc VALUES (45, 'Análisis bioinformático AgingSKIN', 10, true, true, 1, '2025-05-04 22:12:06.335108+02', 4, NULL);
INSERT INTO lims_pre.dim_tecnicas_proc VALUES (46, 'Elaboración informe AgingSKIN', 11, true, true, 1, '2025-05-04 22:12:06.335108+02', 4, NULL);
INSERT INTO lims_pre.dim_tecnicas_proc VALUES (47, 'Validación informe AgingSKIN', 12, true, true, 1, '2025-05-04 22:12:06.335108+02', 4, NULL);
INSERT INTO lims_pre.dim_tecnicas_proc VALUES (48, 'Envío resultados a cliente', 13, true, true, 1, '2025-05-04 22:12:06.335108+02', 4, NULL);
INSERT INTO lims_pre.dim_tecnicas_proc VALUES (1, 'Extracción ADN saliva/sangre', 1, true, true, 1, '2025-05-04 22:05:16.610096+02', 1, 10);


--
-- TOC entry 3622 (class 0 OID 27724)
-- Dependencies: 215
-- Data for Name: dim_tipo_muestra; Type: TABLE DATA; Schema: lims_pre; Owner: postgres
--

INSERT INTO lims_pre.dim_tipo_muestra VALUES (1, 'DNA001', 'ADN', 3, '2025-05-02 09:15:00');
INSERT INTO lims_pre.dim_tipo_muestra VALUES (2, 'SANGRE001', 'SANGRE', 2, '2025-05-02 09:15:00');


--
-- TOC entry 3634 (class 0 OID 27964)
-- Dependencies: 227
-- Data for Name: dim_ubicacion; Type: TABLE DATA; Schema: lims_pre; Owner: postgres
--

INSERT INTO lims_pre.dim_ubicacion VALUES (1, 'REF01', 'Frigo 0021', true, 1, '2025-05-07 11:00:00');
INSERT INTO lims_pre.dim_ubicacion VALUES (2, 'REF012', 'Frigo 322', true, 2, '2025-05-07 11:00:00');
INSERT INTO lims_pre.dim_ubicacion VALUES (3, 'REF013', 'PET 423', true, 3, '2025-05-07 11:00:00');
INSERT INTO lims_pre.dim_ubicacion VALUES (4, 'REF014', 'Despensa 001', true, 1, '2025-05-07 11:00:00');
INSERT INTO lims_pre.dim_ubicacion VALUES (5, 'REF015', 'Despensa 002', true, 2, '2025-05-07 11:00:00');
INSERT INTO lims_pre.dim_ubicacion VALUES (6, 'REF016', 'Despensa 003', true, 3, '2025-05-07 11:00:00');
INSERT INTO lims_pre.dim_ubicacion VALUES (8, 'REF018', 'Fee Ding 1
', true, 3, '2025-10-06 11:47:26.466');
INSERT INTO lims_pre.dim_ubicacion VALUES (9, '08', 'kk', true, NULL, '2025-10-06 11:57:21.356');


--
-- TOC entry 3642 (class 0 OID 33135)
-- Dependencies: 235
-- Data for Name: muestra; Type: TABLE DATA; Schema: lims_pre; Owner: postgres
--

INSERT INTO lims_pre.muestra VALUES (110, 1, 61, 4, 1, 1, 1, NULL, NULL, '', 'EXT_01', '2025-09-26 02:00:00+02', '2025-09-26 02:00:00+02', '2025-09-26 02:00:00+02', '2025-09-26 02:00:00+02', false, 'RECIBIDA', '2025-09-27 09:02:39.861+02', NULL, NULL, NULL, 1, 1);
INSERT INTO lims_pre.muestra VALUES (111, 3, 62, 4, 1, 3, 2, NULL, NULL, '', 'EXT_02', '2025-09-26 02:00:00+02', '2025-09-26 02:00:00+02', '2025-09-26 02:00:00+02', '2025-09-26 02:00:00+02', false, 'RECIBIDA', '2025-09-30 19:18:08.41+02', NULL, NULL, NULL, 4, 1);


--
-- TOC entry 3618 (class 0 OID 27697)
-- Dependencies: 211
-- Data for Name: muestra_array; Type: TABLE DATA; Schema: lims_pre; Owner: postgres
--



--
-- TOC entry 3632 (class 0 OID 27956)
-- Dependencies: 225
-- Data for Name: muestra_ubicacion; Type: TABLE DATA; Schema: lims_pre; Owner: postgres
--



--
-- TOC entry 3620 (class 0 OID 27714)
-- Dependencies: 213
-- Data for Name: resultado; Type: TABLE DATA; Schema: lims_pre; Owner: postgres
--



--
-- TOC entry 3650 (class 0 OID 33197)
-- Dependencies: 243
-- Data for Name: roles; Type: TABLE DATA; Schema: lims_pre; Owner: postgres
--

INSERT INTO lims_pre.roles VALUES (1, 'Admin', true, false, true, '2025-04-30 21:06:00+02', '2025-04-30 21:06:00+02', NULL);
INSERT INTO lims_pre.roles VALUES (2, 'Tecnico', false, false, true, '2025-04-30 21:06:00+02', '2025-04-30 21:06:00+02', NULL);


--
-- TOC entry 3640 (class 0 OID 33116)
-- Dependencies: 233
-- Data for Name: solicitud; Type: TABLE DATA; Schema: lims_pre; Owner: postgres
--

INSERT INTO lims_pre.solicitud VALUES (61, NULL, 1, '2025-09-26 02:00:00+02', '2025-09-26 02:00:00+02', '2025-09-26 02:00:00+02', '2025-09-26 02:00:00+02', '2025-09-26 02:00:00+02', 'Condiciones 1', 'Tiempo 1', 'REGISTRADA', NULL, '2025-09-27 09:02:39.85+02', NULL, NULL);
INSERT INTO lims_pre.solicitud VALUES (62, NULL, 3, '2025-09-26 02:00:00+02', '2025-09-26 02:00:00+02', '2025-09-26 02:00:00+02', '2025-09-26 02:00:00+02', '2025-09-26 02:00:00+02', 'Condiciones de envío', 'Tiempo en hielo', 'REGISTRADA', NULL, '2025-09-30 19:18:08.398+02', NULL, NULL);


--
-- TOC entry 3644 (class 0 OID 33156)
-- Dependencies: 237
-- Data for Name: tecnicas; Type: TABLE DATA; Schema: lims_pre; Owner: postgres
--

INSERT INTO lims_pre.tecnicas VALUES (315, 111, 38, NULL, NULL, 'PENDIENTE_TECNICA', '2025-09-30 19:18:08.414+02', NULL, NULL, '2025-09-30 19:18:08.414+02', NULL, NULL, NULL, 8);
INSERT INTO lims_pre.tecnicas VALUES (316, 111, 39, NULL, NULL, 'PENDIENTE_TECNICA', '2025-09-30 19:18:08.414+02', NULL, NULL, '2025-09-30 19:18:08.414+02', NULL, NULL, NULL, 8);
INSERT INTO lims_pre.tecnicas VALUES (317, 111, 40, NULL, NULL, 'PENDIENTE_TECNICA', '2025-09-30 19:18:08.414+02', NULL, NULL, '2025-09-30 19:18:08.414+02', NULL, NULL, NULL, 8);
INSERT INTO lims_pre.tecnicas VALUES (318, 111, 41, NULL, NULL, 'PENDIENTE_TECNICA', '2025-09-30 19:18:08.414+02', NULL, NULL, '2025-09-30 19:18:08.414+02', NULL, NULL, NULL, 8);
INSERT INTO lims_pre.tecnicas VALUES (319, 111, 42, NULL, NULL, 'PENDIENTE_TECNICA', '2025-09-30 19:18:08.414+02', NULL, NULL, '2025-09-30 19:18:08.415+02', NULL, NULL, NULL, 8);
INSERT INTO lims_pre.tecnicas VALUES (321, 111, 44, NULL, NULL, 'PENDIENTE_TECNICA', '2025-09-30 19:18:08.414+02', NULL, NULL, '2025-09-30 19:18:08.415+02', NULL, NULL, NULL, 8);
INSERT INTO lims_pre.tecnicas VALUES (322, 111, 45, NULL, NULL, 'PENDIENTE_TECNICA', '2025-09-30 19:18:08.414+02', NULL, NULL, '2025-09-30 19:18:08.415+02', NULL, NULL, NULL, 8);
INSERT INTO lims_pre.tecnicas VALUES (323, 111, 46, NULL, NULL, 'PENDIENTE_TECNICA', '2025-09-30 19:18:08.414+02', NULL, NULL, '2025-09-30 19:18:08.415+02', NULL, NULL, NULL, 8);
INSERT INTO lims_pre.tecnicas VALUES (324, 111, 47, NULL, NULL, 'PENDIENTE_TECNICA', '2025-09-30 19:18:08.414+02', NULL, NULL, '2025-09-30 19:18:08.415+02', NULL, NULL, NULL, 8);
INSERT INTO lims_pre.tecnicas VALUES (325, 111, 48, 5, NULL, 'PENDIENTE_TECNICA', '2025-09-30 19:18:08.414+02', NULL, NULL, '2025-10-01 09:07:48.297+02', NULL, NULL, 19, 8);
INSERT INTO lims_pre.tecnicas VALUES (313, 111, 36, 4, NULL, 'PENDIENTE_TECNICA', '2025-09-30 19:18:08.414+02', NULL, NULL, '2025-10-01 16:02:45.83+02', NULL, NULL, 20, 8);
INSERT INTO lims_pre.tecnicas VALUES (320, 111, 43, NULL, NULL, 'PENDIENTE_TECNICA', '2025-09-30 19:18:08.414+02', NULL, NULL, '2025-10-01 17:17:37.125+02', NULL, NULL, 21, 8);
INSERT INTO lims_pre.tecnicas VALUES (314, 111, 37, 5, NULL, 'PENDIENTE_TECNICA', '2025-09-30 19:18:08.414+02', NULL, NULL, '2025-10-01 17:17:42.865+02', NULL, NULL, 18, 8);
INSERT INTO lims_pre.tecnicas VALUES (311, 110, 9, 5, NULL, 'PENDIENTE_TECNICA', '2025-09-27 09:02:39.865+02', NULL, NULL, '2025-10-01 09:07:48.297+02', NULL, NULL, 19, 8);
INSERT INTO lims_pre.tecnicas VALUES (304, 110, 2, NULL, NULL, 'PENDIENTE_TECNICA', '2025-09-27 09:02:39.865+02', NULL, NULL, '2025-09-27 09:02:39.865+02', NULL, NULL, NULL, 8);
INSERT INTO lims_pre.tecnicas VALUES (305, 110, 3, NULL, NULL, 'PENDIENTE_TECNICA', '2025-09-27 09:02:39.865+02', NULL, NULL, '2025-09-27 09:02:39.865+02', NULL, NULL, NULL, 8);
INSERT INTO lims_pre.tecnicas VALUES (306, 110, 4, NULL, NULL, 'PENDIENTE_TECNICA', '2025-09-27 09:02:39.865+02', NULL, NULL, '2025-09-27 09:02:39.865+02', NULL, NULL, NULL, 8);
INSERT INTO lims_pre.tecnicas VALUES (307, 110, 5, NULL, NULL, 'PENDIENTE_TECNICA', '2025-09-27 09:02:39.865+02', NULL, NULL, '2025-09-27 09:02:39.865+02', NULL, NULL, NULL, 8);
INSERT INTO lims_pre.tecnicas VALUES (308, 110, 6, NULL, NULL, 'PENDIENTE_TECNICA', '2025-09-27 09:02:39.865+02', NULL, NULL, '2025-09-27 09:02:39.865+02', NULL, NULL, NULL, 8);
INSERT INTO lims_pre.tecnicas VALUES (309, 110, 7, NULL, NULL, 'PENDIENTE_TECNICA', '2025-09-27 09:02:39.865+02', NULL, NULL, '2025-09-27 09:02:39.865+02', NULL, NULL, NULL, 8);
INSERT INTO lims_pre.tecnicas VALUES (310, 110, 8, NULL, NULL, 'PENDIENTE_TECNICA', '2025-09-27 09:02:39.865+02', NULL, NULL, '2025-09-27 09:02:39.865+02', NULL, NULL, NULL, 8);
INSERT INTO lims_pre.tecnicas VALUES (312, 110, 1, 4, NULL, 'PENDIENTE_TECNICA', '2025-09-27 09:02:39.865+02', NULL, NULL, '2025-10-01 16:02:45.83+02', NULL, NULL, 20, 8);


--
-- TOC entry 3652 (class 0 OID 33206)
-- Dependencies: 245
-- Data for Name: usuarios; Type: TABLE DATA; Schema: lims_pre; Owner: postgres
--

INSERT INTO lims_pre.usuarios VALUES (2, 'Rafa', 'rafa', '$2b$10$5cYn9OzR/RoxYasV/c3xse6GHLItbSZpaaIn.As6XEZc6/XVTIksC', 'rafa@lims.com', 1, '2025-04-30 21:24:15.94+02', '2025-04-30 21:24:15.941+02', NULL);
INSERT INTO lims_pre.usuarios VALUES (3, 'Miquel', 'miquel', '$2b$10$5cYn9OzR/RoxYasV/c3xse6GHLItbSZpaaIn.As6XEZc6/XVTIksC', 'miquel@lims.com', 1, '2025-04-30 21:24:15.94+02', '2025-04-30 21:24:15.941+02', NULL);
INSERT INTO lims_pre.usuarios VALUES (4, 'Tecnico', 'tecnico', '$2b$10$5cYn9OzR/RoxYasV/c3xse6GHLItbSZpaaIn.As6XEZc6/XVTIksC', 'tecnico@lims.com', 2, '2025-04-30 21:24:15.94+02', '2025-04-30 21:24:15.941+02', NULL);
INSERT INTO lims_pre.usuarios VALUES (1, 'Demo Admin2', 'demo2', '$2b$10$5cYn9OzR/RoxYasV/c3xse6GHLItbSZpaaIn.As6XEZc6/XVTIksC', 'demo2@lims.com', 1, '2025-04-30 21:24:15.94+02', '2025-04-30 21:24:15.941+02', NULL);
INSERT INTO lims_pre.usuarios VALUES (5, 'Demo Admin', 'demo', '$2b$10$bUNIn0ho7zWF6uG/2WqLyOe3mr1qACBBrEGqbrKMPohMcmGUnEM5m', 'demo@lims.com', 2, '2025-08-22 09:22:42.303+02', '2025-08-22 09:22:42.304+02', NULL);


--
-- TOC entry 3659 (class 0 OID 47245)
-- Dependencies: 252
-- Data for Name: worklist; Type: TABLE DATA; Schema: lims_pre; Owner: postgres
--

INSERT INTO lims_pre.worklist VALUES (18, 'Primera lista de trabajo', '2025-09-30 19:26:14.505+02', NULL, '2025-09-30 19:26:14.507+02', 5, NULL, 'Cuantificación Qubit');
INSERT INTO lims_pre.worklist VALUES (19, 'Demo', '2025-10-01 09:07:44.535+02', NULL, '2025-10-01 09:07:44.539+02', 5, NULL, 'Envío resultados a cliente');
INSERT INTO lims_pre.worklist VALUES (20, 'Extracción ADN', '2025-10-01 16:02:35.303+02', NULL, '2025-10-01 16:02:35.305+02', 5, NULL, 'Extracción ADN saliva/sangre');
INSERT INTO lims_pre.worklist VALUES (21, 'TM-202', '2025-10-01 17:17:37.101+02', NULL, '2025-10-01 17:17:37.105+02', 5, NULL, 'Cuantificación producto final');


--
-- TOC entry 3691 (class 0 OID 0)
-- Dependencies: 216
-- Name: dim_cat_resultados_id_seq; Type: SEQUENCE SET; Schema: lims_pre; Owner: postgres
--

SELECT pg_catalog.setval('lims_pre.dim_cat_resultados_id_seq', 1, false);


--
-- TOC entry 3692 (class 0 OID 0)
-- Dependencies: 249
-- Name: dim_centros_id_seq; Type: SEQUENCE SET; Schema: lims_pre; Owner: postgres
--

SELECT pg_catalog.setval('lims_pre.dim_centros_id_seq', 7, true);


--
-- TOC entry 3693 (class 0 OID 0)
-- Dependencies: 228
-- Name: dim_clientes_id_seq; Type: SEQUENCE SET; Schema: lims_pre; Owner: postgres
--

SELECT pg_catalog.setval('lims_pre.dim_clientes_id_seq', 4, true);


--
-- TOC entry 3694 (class 0 OID 0)
-- Dependencies: 251
-- Name: dim_criterios_validacion_id_seq; Type: SEQUENCE SET; Schema: lims_pre; Owner: postgres
--

SELECT pg_catalog.setval('lims_pre.dim_criterios_validacion_id_seq', 4, true);


--
-- TOC entry 3695 (class 0 OID 0)
-- Dependencies: 254
-- Name: dim_estados_id_seq; Type: SEQUENCE SET; Schema: lims_pre; Owner: postgres
--

SELECT pg_catalog.setval('lims_pre.dim_estados_id_seq', 15, true);


--
-- TOC entry 3696 (class 0 OID 0)
-- Dependencies: 222
-- Name: dim_maquinas_id_seq; Type: SEQUENCE SET; Schema: lims_pre; Owner: postgres
--

SELECT pg_catalog.setval('lims_pre.dim_maquinas_id_seq', 9, true);


--
-- TOC entry 3697 (class 0 OID 0)
-- Dependencies: 246
-- Name: dim_pacientes_id_seq; Type: SEQUENCE SET; Schema: lims_pre; Owner: postgres
--

SELECT pg_catalog.setval('lims_pre.dim_pacientes_id_seq', 4, true);


--
-- TOC entry 3698 (class 0 OID 0)
-- Dependencies: 220
-- Name: dim_pipetas_id_seq; Type: SEQUENCE SET; Schema: lims_pre; Owner: postgres
--

SELECT pg_catalog.setval('lims_pre.dim_pipetas_id_seq', 42, false);


--
-- TOC entry 3699 (class 0 OID 0)
-- Dependencies: 238
-- Name: dim_plantilla_tecnica_id_seq; Type: SEQUENCE SET; Schema: lims_pre; Owner: postgres
--

SELECT pg_catalog.setval('lims_pre.dim_plantilla_tecnica_id_seq', 17, false);


--
-- TOC entry 3700 (class 0 OID 0)
-- Dependencies: 230
-- Name: dim_pruebas_id_seq; Type: SEQUENCE SET; Schema: lims_pre; Owner: postgres
--

SELECT pg_catalog.setval('lims_pre.dim_pruebas_id_seq', 7, true);


--
-- TOC entry 3701 (class 0 OID 0)
-- Dependencies: 218
-- Name: dim_reactivos_id_seq; Type: SEQUENCE SET; Schema: lims_pre; Owner: postgres
--

SELECT pg_catalog.setval('lims_pre.dim_reactivos_id_seq', 1, true);


--
-- TOC entry 3702 (class 0 OID 0)
-- Dependencies: 240
-- Name: dim_tecnicas_proc_id_seq; Type: SEQUENCE SET; Schema: lims_pre; Owner: postgres
--

SELECT pg_catalog.setval('lims_pre.dim_tecnicas_proc_id_seq', 49, false);


--
-- TOC entry 3703 (class 0 OID 0)
-- Dependencies: 214
-- Name: dim_tipo_muestra_id_seq; Type: SEQUENCE SET; Schema: lims_pre; Owner: postgres
--

SELECT pg_catalog.setval('lims_pre.dim_tipo_muestra_id_seq', 3, false);


--
-- TOC entry 3704 (class 0 OID 0)
-- Dependencies: 226
-- Name: dim_ubicacion_id_seq; Type: SEQUENCE SET; Schema: lims_pre; Owner: postgres
--

SELECT pg_catalog.setval('lims_pre.dim_ubicacion_id_seq', 9, true);


--
-- TOC entry 3705 (class 0 OID 0)
-- Dependencies: 210
-- Name: muestra_array_id_array_seq; Type: SEQUENCE SET; Schema: lims_pre; Owner: postgres
--

SELECT pg_catalog.setval('lims_pre.muestra_array_id_array_seq', 1, false);


--
-- TOC entry 3706 (class 0 OID 0)
-- Dependencies: 234
-- Name: muestra_id_muestra_seq; Type: SEQUENCE SET; Schema: lims_pre; Owner: postgres
--

SELECT pg_catalog.setval('lims_pre.muestra_id_muestra_seq', 111, true);


--
-- TOC entry 3707 (class 0 OID 0)
-- Dependencies: 224
-- Name: muestra_ubicacion_id_muestra_ubic_seq; Type: SEQUENCE SET; Schema: lims_pre; Owner: postgres
--

SELECT pg_catalog.setval('lims_pre.muestra_ubicacion_id_muestra_ubic_seq', 1, false);


--
-- TOC entry 3708 (class 0 OID 0)
-- Dependencies: 212
-- Name: resultado_id_resultado_seq; Type: SEQUENCE SET; Schema: lims_pre; Owner: postgres
--

SELECT pg_catalog.setval('lims_pre.resultado_id_resultado_seq', 1, false);


--
-- TOC entry 3709 (class 0 OID 0)
-- Dependencies: 242
-- Name: roles_id_rol_seq; Type: SEQUENCE SET; Schema: lims_pre; Owner: postgres
--

SELECT pg_catalog.setval('lims_pre.roles_id_rol_seq', 3, false);


--
-- TOC entry 3710 (class 0 OID 0)
-- Dependencies: 232
-- Name: solicitud_id_solicitud_seq; Type: SEQUENCE SET; Schema: lims_pre; Owner: postgres
--

SELECT pg_catalog.setval('lims_pre.solicitud_id_solicitud_seq', 62, true);


--
-- TOC entry 3711 (class 0 OID 0)
-- Dependencies: 236
-- Name: tecnicas_id_tecnica_seq; Type: SEQUENCE SET; Schema: lims_pre; Owner: postgres
--

SELECT pg_catalog.setval('lims_pre.tecnicas_id_tecnica_seq', 325, true);


--
-- TOC entry 3712 (class 0 OID 0)
-- Dependencies: 244
-- Name: usuarios_id_usuario_seq; Type: SEQUENCE SET; Schema: lims_pre; Owner: postgres
--

SELECT pg_catalog.setval('lims_pre.usuarios_id_usuario_seq', 5, true);


--
-- TOC entry 3713 (class 0 OID 0)
-- Dependencies: 253
-- Name: worklist_id_worklist_seq; Type: SEQUENCE SET; Schema: lims_pre; Owner: postgres
--

SELECT pg_catalog.setval('lims_pre.worklist_id_worklist_seq', 21, true);


--
-- TOC entry 3429 (class 2606 OID 27757)
-- Name: dim_cat_resultados dim_cat_resultados_pkey; Type: CONSTRAINT; Schema: lims_pre; Owner: postgres
--

ALTER TABLE ONLY lims_pre.dim_cat_resultados
    ADD CONSTRAINT dim_cat_resultados_pkey PRIMARY KEY (id);


--
-- TOC entry 3465 (class 2606 OID 47232)
-- Name: dim_centros dim_centros_pk; Type: CONSTRAINT; Schema: lims_pre; Owner: postgres
--

ALTER TABLE ONLY lims_pre.dim_centros
    ADD CONSTRAINT dim_centros_pk PRIMARY KEY (id);


--
-- TOC entry 3441 (class 2606 OID 33104)
-- Name: dim_clientes dim_clientes_pkey; Type: CONSTRAINT; Schema: lims_pre; Owner: postgres
--

ALTER TABLE ONLY lims_pre.dim_clientes
    ADD CONSTRAINT dim_clientes_pkey PRIMARY KEY (id);


--
-- TOC entry 3467 (class 2606 OID 47242)
-- Name: dim_criterios_validacion dim_criterios_validacion_pk; Type: CONSTRAINT; Schema: lims_pre; Owner: postgres
--

ALTER TABLE ONLY lims_pre.dim_criterios_validacion
    ADD CONSTRAINT dim_criterios_validacion_pk PRIMARY KEY (id);


--
-- TOC entry 3471 (class 2606 OID 49481)
-- Name: dim_estados dim_estados_pkey; Type: CONSTRAINT; Schema: lims_pre; Owner: postgres
--

ALTER TABLE ONLY lims_pre.dim_estados
    ADD CONSTRAINT dim_estados_pkey PRIMARY KEY (id);


--
-- TOC entry 3435 (class 2606 OID 27793)
-- Name: dim_maquinas dim_maquinas_pkey; Type: CONSTRAINT; Schema: lims_pre; Owner: postgres
--

ALTER TABLE ONLY lims_pre.dim_maquinas
    ADD CONSTRAINT dim_maquinas_pkey PRIMARY KEY (id);


--
-- TOC entry 3463 (class 2606 OID 38856)
-- Name: dim_pacientes dim_pacientes_pkey; Type: CONSTRAINT; Schema: lims_pre; Owner: postgres
--

ALTER TABLE ONLY lims_pre.dim_pacientes
    ADD CONSTRAINT dim_pacientes_pkey PRIMARY KEY (id);


--
-- TOC entry 3433 (class 2606 OID 27784)
-- Name: dim_pipetas dim_pipetas_pkey; Type: CONSTRAINT; Schema: lims_pre; Owner: postgres
--

ALTER TABLE ONLY lims_pre.dim_pipetas
    ADD CONSTRAINT dim_pipetas_pkey PRIMARY KEY (id);


--
-- TOC entry 3451 (class 2606 OID 33176)
-- Name: dim_plantilla_tecnica dim_plantilla_tecnica_pkey; Type: CONSTRAINT; Schema: lims_pre; Owner: postgres
--

ALTER TABLE ONLY lims_pre.dim_plantilla_tecnica
    ADD CONSTRAINT dim_plantilla_tecnica_pkey PRIMARY KEY (id);


--
-- TOC entry 3443 (class 2606 OID 33114)
-- Name: dim_pruebas dim_pruebas_pkey; Type: CONSTRAINT; Schema: lims_pre; Owner: postgres
--

ALTER TABLE ONLY lims_pre.dim_pruebas
    ADD CONSTRAINT dim_pruebas_pkey PRIMARY KEY (id);


--
-- TOC entry 3431 (class 2606 OID 27775)
-- Name: dim_reactivos dim_reactivos_pkey; Type: CONSTRAINT; Schema: lims_pre; Owner: postgres
--

ALTER TABLE ONLY lims_pre.dim_reactivos
    ADD CONSTRAINT dim_reactivos_pkey PRIMARY KEY (id);


--
-- TOC entry 3453 (class 2606 OID 33185)
-- Name: dim_tecnicas_proc dim_tecnicas_proc_pkey; Type: CONSTRAINT; Schema: lims_pre; Owner: postgres
--

ALTER TABLE ONLY lims_pre.dim_tecnicas_proc
    ADD CONSTRAINT dim_tecnicas_proc_pkey PRIMARY KEY (id);


--
-- TOC entry 3427 (class 2606 OID 27730)
-- Name: dim_tipo_muestra dim_tipo_muestra_pkey; Type: CONSTRAINT; Schema: lims_pre; Owner: postgres
--

ALTER TABLE ONLY lims_pre.dim_tipo_muestra
    ADD CONSTRAINT dim_tipo_muestra_pkey PRIMARY KEY (id);


--
-- TOC entry 3439 (class 2606 OID 27971)
-- Name: dim_ubicacion dim_ubicacion_pkey; Type: CONSTRAINT; Schema: lims_pre; Owner: postgres
--

ALTER TABLE ONLY lims_pre.dim_ubicacion
    ADD CONSTRAINT dim_ubicacion_pkey PRIMARY KEY (id);


--
-- TOC entry 3423 (class 2606 OID 27704)
-- Name: muestra_array muestra_array_pkey; Type: CONSTRAINT; Schema: lims_pre; Owner: postgres
--

ALTER TABLE ONLY lims_pre.muestra_array
    ADD CONSTRAINT muestra_array_pkey PRIMARY KEY (id_array);


--
-- TOC entry 3447 (class 2606 OID 33144)
-- Name: muestra muestra_pkey; Type: CONSTRAINT; Schema: lims_pre; Owner: postgres
--

ALTER TABLE ONLY lims_pre.muestra
    ADD CONSTRAINT muestra_pkey PRIMARY KEY (id_muestra);


--
-- TOC entry 3437 (class 2606 OID 27962)
-- Name: muestra_ubicacion muestra_ubicacion_pkey; Type: CONSTRAINT; Schema: lims_pre; Owner: postgres
--

ALTER TABLE ONLY lims_pre.muestra_ubicacion
    ADD CONSTRAINT muestra_ubicacion_pkey PRIMARY KEY (id_muestra_ubic);


--
-- TOC entry 3425 (class 2606 OID 27722)
-- Name: resultado resultado_pkey; Type: CONSTRAINT; Schema: lims_pre; Owner: postgres
--

ALTER TABLE ONLY lims_pre.resultado
    ADD CONSTRAINT resultado_pkey PRIMARY KEY (id_resultado);


--
-- TOC entry 3455 (class 2606 OID 33204)
-- Name: roles roles_name_key; Type: CONSTRAINT; Schema: lims_pre; Owner: postgres
--

ALTER TABLE ONLY lims_pre.roles
    ADD CONSTRAINT roles_name_key UNIQUE (name);


--
-- TOC entry 3457 (class 2606 OID 33202)
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: lims_pre; Owner: postgres
--

ALTER TABLE ONLY lims_pre.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id_rol);


--
-- TOC entry 3445 (class 2606 OID 33123)
-- Name: solicitud solicitud_pkey; Type: CONSTRAINT; Schema: lims_pre; Owner: postgres
--

ALTER TABLE ONLY lims_pre.solicitud
    ADD CONSTRAINT solicitud_pkey PRIMARY KEY (id_solicitud);


--
-- TOC entry 3449 (class 2606 OID 33163)
-- Name: tecnicas tecnicas_pkey; Type: CONSTRAINT; Schema: lims_pre; Owner: postgres
--

ALTER TABLE ONLY lims_pre.tecnicas
    ADD CONSTRAINT tecnicas_pkey PRIMARY KEY (id_tecnica);


--
-- TOC entry 3459 (class 2606 OID 33214)
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: lims_pre; Owner: postgres
--

ALTER TABLE ONLY lims_pre.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id_usuario);


--
-- TOC entry 3461 (class 2606 OID 33216)
-- Name: usuarios usuarios_username_key; Type: CONSTRAINT; Schema: lims_pre; Owner: postgres
--

ALTER TABLE ONLY lims_pre.usuarios
    ADD CONSTRAINT usuarios_username_key UNIQUE (username);


--
-- TOC entry 3469 (class 2606 OID 47254)
-- Name: worklist worklist_pk; Type: CONSTRAINT; Schema: lims_pre; Owner: postgres
--

ALTER TABLE ONLY lims_pre.worklist
    ADD CONSTRAINT worklist_pk PRIMARY KEY (id_worklist);


--
-- TOC entry 3476 (class 2606 OID 33191)
-- Name: dim_tecnicas_proc dim_tecnicas_proc_id_plantilla_tecnica_fkey; Type: FK CONSTRAINT; Schema: lims_pre; Owner: postgres
--

ALTER TABLE ONLY lims_pre.dim_tecnicas_proc
    ADD CONSTRAINT dim_tecnicas_proc_id_plantilla_tecnica_fkey FOREIGN KEY (id_plantilla_tecnica) REFERENCES lims_pre.dim_plantilla_tecnica(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3475 (class 2606 OID 33186)
-- Name: dim_tecnicas_proc dim_tecnicas_proc_id_prueba_fkey; Type: FK CONSTRAINT; Schema: lims_pre; Owner: postgres
--

ALTER TABLE ONLY lims_pre.dim_tecnicas_proc
    ADD CONSTRAINT dim_tecnicas_proc_id_prueba_fkey FOREIGN KEY (id_prueba) REFERENCES lims_pre.dim_pruebas(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3473 (class 2606 OID 33150)
-- Name: muestra muestra_id_solicitud_fkey; Type: FK CONSTRAINT; Schema: lims_pre; Owner: postgres
--

ALTER TABLE ONLY lims_pre.muestra
    ADD CONSTRAINT muestra_id_solicitud_fkey FOREIGN KEY (id_solicitud) REFERENCES lims_pre.solicitud(id_solicitud) ON UPDATE CASCADE;


--
-- TOC entry 3472 (class 2606 OID 33124)
-- Name: solicitud solicitud_id_cliente_fkey; Type: FK CONSTRAINT; Schema: lims_pre; Owner: postgres
--

ALTER TABLE ONLY lims_pre.solicitud
    ADD CONSTRAINT solicitud_id_cliente_fkey FOREIGN KEY (id_cliente) REFERENCES lims_pre.dim_clientes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3474 (class 2606 OID 33164)
-- Name: tecnicas tecnicas_id_muestra_fkey; Type: FK CONSTRAINT; Schema: lims_pre; Owner: postgres
--

ALTER TABLE ONLY lims_pre.tecnicas
    ADD CONSTRAINT tecnicas_id_muestra_fkey FOREIGN KEY (id_muestra) REFERENCES lims_pre.muestra(id_muestra) ON UPDATE CASCADE;


--
-- TOC entry 3477 (class 2606 OID 33217)
-- Name: usuarios usuarios_id_rol_fkey; Type: FK CONSTRAINT; Schema: lims_pre; Owner: postgres
--

ALTER TABLE ONLY lims_pre.usuarios
    ADD CONSTRAINT usuarios_id_rol_fkey FOREIGN KEY (id_rol) REFERENCES lims_pre.roles(id_rol) ON UPDATE CASCADE ON DELETE SET NULL;


-- Completed on 2025-10-10 16:07:45 CEST

--
-- PostgreSQL database dump complete
--

