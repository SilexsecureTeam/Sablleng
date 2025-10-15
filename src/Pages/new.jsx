Add to cart 
endpoint: https://api.sablle.ng/api/cart/add
parameters: product_id : 2, quantity : 3, price : 70000, color : "yellow"
method: POST
result: {
    "message": "Item added to cart successfully",
    "cart_session_id": "3353ba6f-b5d5-4022-952d-b8cf74d80d1d",
    "data": {
        "cart_id": 2,
        "product_id": "2",
        "quantity": "3",
        "price": "70000",
        "color": "yellow",
        "customization_id": null,
        "updated_at": "2025-10-15T13:46:54.000000Z",
        "created_at": "2025-10-15T13:46:54.000000Z",
        "id": 12,
        "cart": {
            "id": 2,
            "user_id": 3,
            "session_id": null,
            "total": 210000,
            "created_at": "2025-10-14T12:07:53.000000Z",
            "updated_at": "2025-10-15T13:46:54.000000Z",
            "items": [
                {
                    "id": 12,
                    "cart_id": 2,
                    "product_id": 2,
                    "color": "yellow",
                    "quantity": 3,
                    "price": "70000.00",
                    "customization_id": null,
                    "created_at": "2025-10-15T13:46:54.000000Z",
                    "updated_at": "2025-10-15T13:46:54.000000Z"
                }
            ]
        },
        "product": {
            "id": 2,
            "category_id": 1,
            "brand_id": null,
            "supplier_id": null,
            "name": "A new baby girl",
            "description": "A new baby girl",
            "images": [],
            "cost_price": "4500.00",
            "tax_rate": null,
            "tax_rate_value": "0.00",
            "cost_inc_tax": "4837.50",
            "sale_price_inc_tax": "4837.50",
            "is_variable_price": false,
            "margin_perc": "0.00",
            "tax_exempt_eligible": true,
            "rr_price": "0.00",
            "bottle_deposit_item_name": null,
            "barcode": "5057784302740",
            "size": [],
            "colours": [],
            "product_code": "11038068",
            "age_restriction": null,
            "created_at": "2025-10-12T07:54:23.000000Z",
            "updated_at": "2025-10-12T07:54:27.000000Z",
            "category": {
                "id": 1,
                "name": "GREETING CARDS",
                "description": null,
                "image": null,
                "is_active": 1,
                "created_at": "2025-10-12T07:54:23.000000Z",
                "updated_at": "2025-10-12T07:56:24.000000Z"
            },
            "brand": null
        },
        "customization": null
    }
}

note when user is signin the session_id is  null just as this and when user is not signin i.e not unauthenticated the session_id is a string. an example is "cart_session_id": "3353ba6f-b5d5-4022-952d-b8cf74d80d1d",  this is to know who the cart 
item belong to and helps with merging the cart after user has login. 

Cart page (Get products)
endpoint: https://api.sablle.ng/api/cart
method: GET
result: {
    "message": "Cart retrieved successfully",
    "data": {
        "id": 1,
        "user_id": 1,
        "session_id": null,
        "total": 0,
        "created_at": "2025-10-13T10:23:12.000000Z",
        "updated_at": "2025-10-15T07:35:46.000000Z",
        "items": []
    }
}

Increase quantity
endpoint: https://api.sablle.ng/api/cart/items/3?quantity=2
parameters: quantity : 2
method: PATCH

Delete Item from Cart
endpoint: https://api.sablle.ng/api/cart/items/1
method: DELETE
result: {
    "message": "Item removed successfully",
    "data": {
        "id": 1,
        "user_id": 1,
        "session_id": null,
        "total": 77980,
        "created_at": "2025-10-13T10:23:12.000000Z",
        "updated_at": "2025-10-15T13:39:03.000000Z",
        "items": [
            {
                "id": 8,
                "cart_id": 1,
                "product_id": 4,
                "color": "white",
                "quantity": 2,
                "price": "38990.00",
                "customization_id": null,
                "created_at": "2025-10-15T08:43:03.000000Z",
                "updated_at": "2025-10-15T08:43:43.000000Z",
                "product": {
                    "id": 4,
                    "category_id": 1,
                    "brand_id": null,
                    "supplier_id": null,
                    "name": "Boy congratulations",
                    "description": "Boy congratulations",
                    "images": [],
                    "cost_price": "4500.00",
                    "tax_rate": null,
                    "tax_rate_value": "0.00",
                    "cost_inc_tax": "4837.50",
                    "sale_price_inc_tax": "4837.50",
                    "is_variable_price": false,
                    "margin_perc": "0.00",
                    "tax_exempt_eligible": true,
                    "rr_price": "0.00",
                    "bottle_deposit_item_name": null,
                    "barcode": "5057784302771",
                    "size": [],
                    "colours": [],
                    "product_code": "11039200",
                    "age_restriction": null,
                    "created_at": "2025-10-12T07:54:23.000000Z",
                    "updated_at": "2025-10-12T07:54:27.000000Z"
                },
                "customization": null
            }
        ]
    }
}

Merge Cart(Guest and Logged in user)
endpoint: https://sablle_api.test/api/cart/merge
method: POST