from __future__ import annotations
import json
from pathlib import Path
from threading import Lock
from typing import Dict, List, Tuple, Any

class MenuStore:
    def __init__(self, data_file: Path, default_menu: Dict[str, Any]):
        self._data_file = data_file
        self._lock = Lock()
        self._menu: Dict[str, Dict[str, Any]] = {}
        self._load(default_menu)

    @staticmethod
    def _normalize_entry(value: Any) -> Dict[str, Any]:
        """标准化数据结构，增加 category 字段"""
        default_cat = "中式经典"
        if isinstance(value, dict):
            return {
                "price": float(value.get("price", 0.0)),
                "image": value.get("image"),
                "category": value.get("category", default_cat)
            }
        # 兼容旧格式（只传价格的情况）
        return {"price": float(value), "image": None, "category": default_cat}

    def _load(self, default_menu: Dict[str, Any]):
        loaded_data = {}
        file_exists = False
        if self._data_file.exists():
            try:
                with self._data_file.open("r", encoding="utf-8") as f:
                    data = json.load(f)
                if isinstance(data, dict):
                    loaded_data = {str(k): self._normalize_entry(v) for k, v in data.items()}
                    file_exists = True
            except Exception:
                pass

        self._menu = loaded_data
        has_new = False
        for name, info in default_menu.items():
            if name not in self._menu:
                self._menu[name] = self._normalize_entry(info)
                has_new = True
        
        if has_new or not file_exists:
            self._save()

    def _save(self):
        try:
            with self._data_file.open("w", encoding="utf-8") as f:
                json.dump(self._menu, f, ensure_ascii=False, indent=2)
        except OSError:
            pass

    def get_menu(self) -> Dict[str, Dict[str, Any]]:
        with self._lock:
            return {name: dict(payload) for name, payload in self._menu.items()}

    def upsert_item(self, name: str, price: float | None = None, image: str | None = None, category: str | None = None):
        with self._lock:
            record = self._menu.get(name, {"price": 0.0, "image": None, "category": "其他"})
            if price is not None: record["price"] = float(price)
            if image is not None: record["image"] = image
            if category is not None: record["category"] = category
            self._menu[name] = record
            self._save()

    def calc_order(self, items: List[str]) -> Tuple[float, List[str], List[Dict]]:
        total = 0.0
        not_found = []
        detail = []
        with self._lock:
            for name in items:
                record = self._menu.get(name)
                if not record:
                    not_found.append(name)
                else:
                    p = float(record.get("price", 0.0))
                    total += p
                    detail.append({"name": name, "price": p})
        return total, not_found, detail