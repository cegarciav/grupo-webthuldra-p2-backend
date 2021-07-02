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

### PATH: POST   /stores/{storeId}/deals

Descripcion: se puede agregar una promesa de compra.

Parametros:

* storeId: Id de una tienda. 

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

## Endpoints Secundarios: ##

### PATH: PATCH   /stores/{storeId}/products/productId ###

Descripcion: Se puede modificar un producto de una tienda. Solo se puede realizar por el dueño de la tienda.

Parametros:  

* storeId: Id de una tienda.
* productId: Id de un producto

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


    400: Informacion para cambiar erronea.
    Ejemplo:
        Bad Request

    403: Usuario no es dueño de la tienda. 
    Ejemplo: 
        You are not allowed to modify product with id ${product.id}

### PATH: DELETE   /stores/{storeId}/products/productId ###

Descripcion: Se puede eliminar un producto de una tienda. Solo se puede realizar por el dueño de la tienda.

Parametros:

* storeId: Id de una tienda.
* productId: Id de un producto

Body request: No aplica  

    {}

Responses: 

    204: El producto se elimina correctamente. 
    Ejemplo:
        No content

    403: Usuario no es dueño de la tienda.
    Ejemplo:
        You are not allowed to remove product with id ${product.id}
    
    400: El id del producto ingresado no existe.
    Ejemplo:
        Bad request

### PATH: GET   /deals/{dealId}/messages ###

Descripcion: Obtiene los mensajes de un deal.

Parametros:

* dealId: Id de un deal.

Body request: No aplica  

    {}

Responses: 

    200: Se muestran los mensajes correctamente. 
    Ejemplo:
        [
            {
                "id": "17ec9b1d-8960-41b5-bd3a-c7b8200708c7",
                "text": "Mensaje 1",
                "dealId": "54c9646d-7454-4887-85ab-2f6a091eeb9c",
                "sender": "customer",
                "senderId": "d4031fce-3fd2-41ff-9eed-2d5e6afbf29d",
                "createdAt": "2021-07-01T22:19:08.630Z",
                "updatedAt": "2021-07-01T22:19:08.630Z"
            },
            {
                "id": "80464054-531b-499a-9064-de9ceedcf2dc",
                "text": "Mensaje 2",
                "dealId": "54c9646d-7454-4887-85ab-2f6a091eeb9c",
                "sender": "customer",
                "senderId": "d4031fce-3fd2-41ff-9eed-2d5e6afbf29d",
                "createdAt": "2021-07-01T22:20:19.498Z",
                "updatedAt": "2021-07-01T22:20:19.498Z"
            }
        ]

    404: No hay mensajes.
    Ejemplo:
        Message with id ${id} could not be found

### PATH: POST   /deals/{dealId}/messages ###

Descripcion: Obtiene los mensajes de un deal.

Parametros:  

* dealId: Id de un deal.

Body request:  

      {
          "text": "me gustaron, buen servicio"
      }

Responses: 

    201: Se crea un mensaje correctamente. 
    Ejemplo:
        {
            "text": "me gustaron, buen servicio",
            "id": "80464054-531b-499a-9064-de9ceedcf2dc",
            "dealId": "54c9646d-7454-4887-85ab-2f6a091eeb9c",
            "sender": "customer",
            "senderId": "d4031fce-3fd2-41ff-9eed-2d5e6afbf29d",
            "updatedAt": "2021-07-01T22:20:19.498Z",
            "createdAt": "2021-07-01T22:20:19.498Z"
        }

    403: El usuario no es dueño del deal.
    Ejemplo:
        You are not allowed to send messages about deal with id ${deal.id}

    400: Informacion para crear un mensaje erronea.
    Ejemplo:
        Bad Request

### PATH: GET   /stores/{storeId}/comments ###

Descripcion: Obtiene los comentarios de una tienda.

Parametros:  

* storeId: Id de una store.

Body request: No aplica  

    {}

Responses: 

    200: Se muestran los comentarios correctamente. 
    Ejemplo:
        [
            {
                "id": "a1ca3a71-5990-44d9-8756-2548f099746e",
                "text": "Muy buena tienda. Tenía buenas donas.",
                "grade": 5,
                "reviewerId": "ba7f37fb-780e-4c57-8f3c-22b0a0f499e1",
                "storeId": "a0a5b325-9ac2-437c-8a71-a1573440d00a",
                "createdAt": "2021-07-02T00:19:33.296Z",
                "updatedAt": "2021-07-02T00:19:33.296Z",
                "store": {
                    "name": "Sra Rosalia",
                    "address": "SanBk3"
                },
                "reviewer": {
                    "firstName": "ariadna",
                    "lastName": "camino",
                    "email": "ariadna.camino@uc.cl"
                }
            }
        ]

    404: No hay mensajes.
    Ejemplo:
        Comment with id ${id} could not be found

### PATH: POST   /stores/{storeId}/comments ###

Descripcion: Se crea un comentario en una tienda.

Parametros:

* storeId: Id de una store.

Body request: grade es una puntuacion de 1 a 5.

    {
        "text": "Comentario",
        "grade": 5
    }

Responses: 

    201: Se se crea un comentario correctamente. 
    Ejemplo:
        {
            "id": "a1ca3a71-5990-44d9-8756-2548f099746e",
            "text": "Muy buena tienda. Tenía buenas donas.",
            "grade": 5,
            "reviewerId": "ba7f37fb-780e-4c57-8f3c-22b0a0f499e1",
            "storeId": "a0a5b325-9ac2-437c-8a71-a1573440d00a",
            "createdAt": "2021-07-02T00:19:33.296Z",
            "updatedAt": "2021-07-02T00:19:33.296Z",
            "store": {
                "name": "Sra Rosalia",
                "address": "SanBk3"
            },
            "reviewer": {
                "firstName": "ariadna",
                "lastName": "camino",
                "email": "ariadna.camino@uc.cl"
            }
        }

    400: Se ingresan mal los datos.
    Ejemplo:
        Bad request

### PATH: DELETE   /stores/{storeId}/comments/commentId ###

Descripcion: Se elimina un comentario en una tienda.

Parametros:

* storeId: Id de una store.
* commentId: Id de un comment.

Body request: No aplica

    {}

Responses: 

    204: Se se elimina un comentario correctamente. 
    Ejemplo:
        {}

    403: El usuario que no sea dueño del comentario no puede eliminarlo.
    Ejemplo:
        You are not allowed to remove comment with id ${comment.id}
    
    400: El id ingresado no existe.
    Ejemplo:
        Bad request
        

### PATH: DELETE   /admin/users/userId ###

Descripcion: El administrador puede eliminar un usuario.

Parametros:

* userId: Id de un usuario.

Body request: No aplica

    {}

Responses: 

    204: Se se elimina un usuario correctamente. 
    Ejemplo:
        {}

    403: El usuario que no sea administrador no puede eliminar un usuario.
    Ejemplo:
        You are not allowed to remove user with id ${user.id}
    
    400: El id ingresado no existe.
    Ejemplo:
        Bad request

### PATH: DELETE   /admin/store/storeId ###

Descripcion: El administrador puede eliminar una store.

Parametros:

* storeId: Id de una store.

Body request: No aplica

    {}

Responses: 

    204: Se se elimina una store correctamente. 
    Ejemplo:
        {}

    403: El usuario que no sea administrador no puede eliminar una store.
    Ejemplo:
        You are not allowed to remove store with id ${store.id}
    
    400: El id ingresado no existe.
    Ejemplo:
        Bad request

### PATH: DELETE   /admin/comments/commentId ###

Descripcion: El administrador puede eliminar un comentario.

Parametros:

* commentId: Id de un comentario.

Body request: No aplica

    {}

Responses: 

    204: Se se elimina un comentario correctamente. 
    Ejemplo:
        {}

    403: El usuario que no sea administrador no puede eliminar un comment.
    Ejemplo:
        You are not allowed to remove comment with id ${comment.id}
    
    400: El id ingresado no existe.
    Ejemplo:
        Bad request






