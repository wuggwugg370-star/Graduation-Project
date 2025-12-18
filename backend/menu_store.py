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
        """标准化数据结构"""
        default_cat = "其他"
        if isinstance(value, dict):
            return {
                "price": float(value.get("price", 0.0)),
                "image": value.get("image", ""),
                "category": value.get("category", default_cat)
            }
        return {"price": float(value), "image": "", "category": default_cat}

    def _load(self, default_menu: Dict[str, Any]):
        loaded_data = {}
        file_valid = False
        
        # 尝试读取现有数据
        if self._data_file.exists():
            try:
                with self._data_file.open("r", encoding="utf-8") as f:
                    data = json.load(f)
                if isinstance(data, dict):
                    loaded_data = {str(k): self._normalize_entry(v) for k, v in data.items()}
                    file_valid = True
            except Exception:
                print("数据文件损坏或格式错误，将重置为默认菜单。")

        self._menu = loaded_data
        
        # 合并默认菜单（如果缺少默认菜品则补全）
        has_changes = False
        for name, info in default_menu.items():
            if name not in self._menu:
                self._menu[name] = self._normalize_entry(info)
                has_changes = True
        
        # 如果文件不存在或有更新，则保存
        if has_changes or not file_valid:
            self._save()

    def _save(self):
        try:
            with self._data_file.open("w", encoding="utf-8") as f:
                json.dump(self._menu, f, ensure_ascii=False, indent=2)
        except OSError as e:
            print(f"保存菜单失败: {e}")

    def get_menu(self) -> Dict[str, Dict[str, Any]]:
        with self._lock:
            # 返回深拷贝，防止外部修改影响内部
            return {k: v.copy() for k, v in self._menu.items()}

    def upsert_item(self, name: str, price: float, category: str, image: str):
        """添加或更新菜品"""
        with self._lock:
            self._menu[name] = {
                "price": float(price),
                "category": category,
                "image": image
            }
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