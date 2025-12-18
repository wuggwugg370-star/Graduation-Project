import json
import os
from pathlib import Path
from threading import Lock
from typing import Dict, Any, Tuple, List

class MenuStore:
    def __init__(self, data_file: Path, default_menu: Dict[str, Any]):
        self._data_file = data_file
        self._lock = Lock()
        self._menu = {}
        self._load(default_menu)

    def _load(self, default_menu: Dict[str, Any]):
        """安全加载数据，如果文件损坏则重置为默认"""
        loaded = False
        if self._data_file.exists():
            try:
                # 检查文件是否为空
                if self._data_file.stat().st_size == 0:
                    raise ValueError("File is empty")
                
                with self._data_file.open("r", encoding="utf-8") as f:
                    data = json.load(f)
                    if isinstance(data, dict):
                        self._menu = data
                        loaded = True
            except Exception as e:
                print(f"[警告] 菜单数据文件损坏或为空，已重置: {e}")
        
        if not loaded:
            self._menu = default_menu.copy()
            self._save()

    def _save(self):
        """原子写入：防止断电或崩溃导致数据丢失"""
        temp_file = self._data_file.with_suffix(".tmp")
        try:
            with temp_file.open("w", encoding="utf-8") as f:
                json.dump(self._menu, f, ensure_ascii=False, indent=2)
            
            # Windows 下 rename 无法覆盖，需先 replace
            if self._data_file.exists():
                os.replace(str(temp_file), str(self._data_file))
            else:
                os.rename(str(temp_file), str(self._data_file))
        except Exception as e:
            print(f"[错误] 保存菜单失败: {e}")
            if temp_file.exists():
                os.remove(temp_file)

    def get_menu(self) -> Dict[str, Any]:
        with self._lock:
            return self._menu.copy()

    def upsert_item(self, name: str, price: str, category: str, image: str):
        with self._lock:
            try:
                p = float(price)
            except ValueError:
                p = 0.0
            
            self._menu[name] = {
                "price": p,
                "category": category,
                "image": image
            }
            self._save()

    def calc_order(self, items: List[str]) -> Tuple[float, List[str], List[Dict]]:
        total = 0.0
        not_found = []
        details = []
        with self._lock:
            for name in items:
                if name in self._menu:
                    p = self._menu[name]["price"]
                    total += p
                    details.append({"name": name, "price": p})
                else:
                    not_found.append(name)
        return total, not_found, details