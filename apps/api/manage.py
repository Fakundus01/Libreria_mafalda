from app import create_app
from app.core.extensions import db
from app.models import ContactMessage, Order, OrderItem, Payment, PrintRequest, Product, ProductImage, User

app = create_app()


@app.shell_context_processor
def shell_context():
    return {
        'db': db,
        'ContactMessage': ContactMessage,
        'Product': Product,
        'ProductImage': ProductImage,
        'Order': Order,
        'OrderItem': OrderItem,
        'Payment': Payment,
        'User': User,
        'PrintRequest': PrintRequest,
    }
