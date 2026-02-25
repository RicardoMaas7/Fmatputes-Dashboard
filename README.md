# FmaputesDashboard

Documentación principal del proyecto FmaputesDashboard. Interfaz de control y gestión de perfiles de usuario, servicios grupales y métricas de equipo. 

El diseño sigue estrictamente la estética "Terminal / The Wired" (fondos oscuros de alto contraste, tipografía monospace).

## Stack Tecnológico y Arquitectura

* **Frontend:** Angular 17+ y Tailwind CSS.
* **Backend:** Node.js (API REST para gestión de datos y conexión con servicios externos).
* **Procesamiento de Datos:** Python (Generación de diagramas de radar para estadísticas).
* **Infraestructura:** Docker Compose, Nginx Proxy Manager (NPM), Cloudflare Zero Trust.

## Entorno de Servidor y Despliegue

La infraestructura está diseñada para operar detrás de un proxy inverso. Los contenedores no deben exponer sus puertos crudos a Internet; en su lugar, se comunican a través de una red interna de Docker compartida con Nginx Proxy Manager.

### Levantar el entorno

Para inicializar los contenedores en el servidor o en local (emulando la red del proxy):

` ` `bash
git clone <url-del-repositorio>
cd FmaputesDashboard
docker compose up --build -d
` ` `

Para detener los servicios:

` ` `bash
docker compose down
` ` `

## Reglas Estrictas de Infraestructura

Cualquier código que se integre a las ramas principales debe cumplir con los siguientes lineamientos arquitectónicos:

1. **Rutas Estáticas (Frontend):** Todos los recursos, assets y enlaces generados en Angular deben construirse de manera relativa. Es obligatorio el uso correcto de `baseHref` en la compilación para garantizar que Nginx resuelva las subrutas sin generar errores 404.
2. **Headers de Proxy (Backend):** Los servicios de Node.js asumen que están detrás de NPM y Cloudflare. La aplicación debe configurarse para confiar en los proxies ascendentes (ej. `trust proxy`) y resolver la identidad del cliente leyendo los headers `X-Forwarded-For`, `X-Forwarded-Proto` y `CF-Connecting-IP`.

## Flujo de Trabajo (Git Flow)

Los *pushes* directos a `main` (producción) y `develop` (integración) están bloqueados por políticas del repositorio. Toda aportación de código debe seguir esta nomenclatura de ramas:

* `feature/nombre-descriptivo` (Nuevas funcionalidades).
* `bugfix/nombre-del-error` (Corrección de defectos).
* `chore/nombre-de-la-tarea` (Mantenimiento, configuración o documentación).

Ejemplo de flujo:
` ` `bash
git checkout develop
git checkout -b feature/auth-node
` ` `

## Checklist Obligatorio para Pull Requests (PRs)

Antes de abrir un Pull Request y solicitar revisión por pares, el desarrollador debe asegurar lo siguiente:

- [ ] El código pasa los linters y compila sin errores de TypeScript.
- [ ] La consola del navegador está libre de advertencias y errores.
- [ ] La interfaz respeta los lineamientos de UI/UX (Fondo oscuro #0a0a0a, tipografía monospace, cero animaciones invasivas).
- [ ] Se aplicaron principios SOLID y DRY; el código es modular y escalable.
- [ ] Se respetó la regla de rutas relativas para Nginx.# Fmatputes-Dashboard