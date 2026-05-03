from faker import Faker

fake = Faker()

def generate_mock_data(schema: dict) -> dict:
    """根据JSON Schema生成Mock数据"""
    return _generate_value(schema)

def _generate_value(schema: dict):
    """递归生成Mock数据"""
    if "type" not in schema:
        return None
    
    type_ = schema["type"]
    
    if type_ == "string":
        return _generate_string(schema)
    elif type_ == "number":
        return _generate_number(schema)
    elif type_ == "integer":
        return _generate_integer(schema)
    elif type_ == "boolean":
        return fake.boolean()
    elif type_ == "array":
        return _generate_array(schema)
    elif type_ == "object":
        return _generate_object(schema)
    else:
        return None

def _generate_string(schema: dict) -> str:
    """生成字符串类型的Mock数据"""
    format_ = schema.get("format", "")
    if format_ == "email":
        return fake.email()
    elif format_ == "url":
        return fake.url()
    elif format_ == "date":
        return fake.date()
    elif format_ == "date-time":
        return fake.iso8601()
    else:
        return fake.word()

def _generate_number(schema: dict) -> float:
    """生成数字类型的Mock数据"""
    return fake.pyfloat()

def _generate_integer(schema: dict) -> int:
    """生成整数类型的Mock数据"""
    return fake.pyint()

def _generate_array(schema: dict) -> list:
    """生成数组类型的Mock数据"""
    items = schema.get("items", {})
    length = schema.get("maxItems", 5)
    return [_generate_value(items) for _ in range(length)]

def _generate_object(schema: dict) -> dict:
    """生成对象类型的Mock数据"""
    properties = schema.get("properties", {})
    obj = {}
    for key, value_schema in properties.items():
        obj[key] = _generate_value(value_schema)
    return obj
