from faker import Faker
from typing import Any, Dict, List

fake = Faker()

class MockGenerator:
    """Mock数据生成器"""
    
    @staticmethod
    def generate_string(format_type: str = "word") -> str:
        """生成字符串类型的Mock数据"""
        generators = {
            "word": fake.word,
            "sentence": fake.sentence,
            "paragraph": fake.paragraph,
            "email": fake.email,
            "url": fake.url,
            "name": fake.name,
            "address": fake.address,
            "phone": fake.phone_number,
            "uuid": fake.uuid4,
            "date": fake.date,
            "datetime": fake.iso8601,
        }
        return generators.get(format_type, fake.word)()
    
    @staticmethod
    def generate_number(min_value: float = 0, max_value: float = 100) -> float:
        """生成数字类型的Mock数据"""
        return fake.pyfloat(min_value=min_value, max_value=max_value)
    
    @staticmethod
    def generate_integer(min_value: int = 0, max_value: int = 100) -> int:
        """生成整数类型的Mock数据"""
        return fake.pyint(min_value=min_value, max_value=max_value)
    
    @staticmethod
    def generate_boolean() -> bool:
        """生成布尔类型的Mock数据"""
        return fake.boolean()
    
    @staticmethod
    def generate_array(item_schema: Dict[str, Any], length: int = 5) -> List[Any]:
        """生成数组类型的Mock数据"""
        from app.services.mock_service import _generate_value
        return [_generate_value(item_schema) for _ in range(length)]
    
    @staticmethod
    def generate_object(properties: Dict[str, Any]) -> Dict[str, Any]:
        """生成对象类型的Mock数据"""
        from app.services.mock_service import _generate_value
        obj = {}
        for key, value_schema in properties.items():
            obj[key] = _generate_value(value_schema)
        return obj
