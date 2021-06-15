# grupo-webthuldra-p2-backend

## Integrantes

* Ariadna Camino
* Carlos Olivos
* Camilo García

## Ayudante encargado

* Diego Solari

## Link aplicación en Heroku
https://webthuldra-api.herokuapp.com/

## Proceso de uso

1. Clonar el repositorio
2. Crear una base de datos en Postgres para el proyecto
3. Crear un archivo .env, en el directorio raíz, que contenga a lo menos las variables descritas en el archivo .env.template
4. Usar el comando yarn install para instalar las dependencias
5. Usar yarn dev para correr la aplicación. Esta podrá ser accedida en http://localhost:3000

## Documentacion:

deal:

PATH: POST   /stores/{storeId}/deals

Descripcion: se puede agregar una promesa de compra.

Parametros: 
    -storeId: Id de una tienda. 

Body request: 
    {
    "products": [
        {
            "id": "6fab7fcb-ef1a-4199-a16a-0a6e5efcb1fe",
            "amount": "3"
        },
        {
            "id": "73100d2c-0331-4450-95c9-c4249917bb1f",
            "amount": "2"
        }
    ]
}

Responses: 

    201: Deal agregado exitosamente
    Ejemplo: 
    {
    "data": {
        "type": "deals",
        "id": "2cac735e-4ef4-4d07-ab53-ac8deabe7391",
        "attributes": {
            "status": "abierto",
            "customer-id": "d5536c9b-ee8a-4ff8-b25e-aaa8d327244b"
            }
        }
    }


    400: Informacion para agregar erronea
    Ejemplo:
    {
        "status": 0,
        "body": {
            "errors": [
            {
                "type": "string",
                "message": "string"
            }
            ]
        }
    }
