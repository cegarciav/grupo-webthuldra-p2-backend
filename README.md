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

Endpoints Secundarios: 

PATH: PATCH   /stores/{storeId}/products/:id

Descripcion: Se puede modificar un producto de una tienda. Solo se puede realizar por el dueño de la tienda.

Parametros: 
    -storeId: Id de una tienda.
    -id: Id de un producto

Body request: 
    {
    "name": "nombre cambiado",
    "stock": 100,
    "price": 600,
    "unit": "Kg",
}

Responses: 

    200: Modificacion realizada exitosamente
    Ejemplo: 
        {
            "id": "b4810cc8-2ba5-43ac-86c3-5e46fe38e00b",
            "name": "nombre cambiado",
            "stock": 100,
            "price": 600,
            "unit": "Kg",
            "storeId": "a0a5b325-9ac2-437c-8a71-a1573440d00a",
            "createdAt": "2021-06-29T03:21:59.290Z",
            "updatedAt": "2021-07-01T23:28:23.691Z"
        }


    400: Informacion para cambiar erronea
    Ejemplo:
        Bad Request

    403: Usuario no es dueño de la tienda. 
    Ejemplo: 
        You are not allowed to modify product with id ${product.id}

PATH: DELETE   /stores/{storeId}/products/:id

Descripcion: Se puede eliminar un producto de una tienda. Solo se puede realizar por el dueño de la tienda.

Parametros: 
    -storeId: Id de una tienda.
    -id: Id de un producto

Body request: No aplica
    {}

Responses: 

    204: El producto se elimina correctamente. 
    Ejemplo:
        No content

    403: Usuario no es dueño de la tienda.
    Ejemplo:
        You are not allowed to remove product with id ${product.id}
