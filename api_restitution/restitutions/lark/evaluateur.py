from lark import Lark, Transformer 
from ..calculs.show import show_postgres_style
from ..calculs.sum import sum_postgres_style
from ..calculs.avg import avg_postgres_style
from ..calculs.min import min_postgres_style
from ..calculs.max import max_postgres_style
from ..calculs.count import count_postgres_style
from ..calculs.mediane import median_postgres_style
from ..calculs.mode import mode_postgres_style
from ..calculs.ecart_type import stddev_postgres_style
from ..calculs.percentiles import percentile_postgres_style
from ..calculs.variance import variance_postgres_style
from ..calculs.growth_rate import growth_rate_postgres_style


def apply_op(left, op, right):
    match op:
        case '+':
            return left + right
        case '-':
            return left - right
        case '*':
            return left * right
        case '/':
            return left / right
        case '%':
            return left % right
        case '<':
            return left < right
        case '>':
            return left > right
        case '<=':
            return left <= right
        case '>=':
            return left >= right
        case '==':
            return left == right
        case '!=':
            return left != right
    raise ValueError(f"Unsupported operator: {op}")
 
class CustomTransformer(Transformer):
    def __init__(self, data, variance_sample, percentile, tc_date_key, tc_global_rate): 
        super().__init__()
        self.data = data 
        self.variance_sample = variance_sample
        self.percentile = percentile
        self.tc_date_key = tc_date_key
        self.tc_global_rate = tc_global_rate
        self.group_by = [] 


    def _to_number(self, val): 
        try:
            if isinstance(val, str):
                return float(val) if '.' in val or 'e' in val.lower() else int(val)
            return val
        except:
            return val
        
        
    def detect_group_by(self, items): 
        self.group_by = [str(field) for field in items[1:]] 
        return self.group_by


    def _apply_on_table(self, table, scalar, op, table_first=True): 
        result = []
        for row in table:
            *prefix, value = row
            value_num = self._to_number(value)
            if table_first:
                res = apply_op(value_num, op, scalar)
            else:
                res = apply_op(scalar, op, value_num)
            result.append((*prefix, res)) 
        return result
    

    def NUMBER(self, token): 
        return float(token) if '.' in token or 'e' in token.lower() else int(token)


    def string(self, token): 
        return str(token)
    

    def OP_COMP(self, token): 
        return str(token)
    

    def list(self, items): 
        return items  # ou list(items)


    def detect_func(self, items):   
        func_name = str(items[0])
        champ = items[1]
        
        func_map = {
            'show': show_postgres_style,
            'count': count_postgres_style,
            'sum': sum_postgres_style,
            'avg': avg_postgres_style,
            'min': min_postgres_style,
            'max': max_postgres_style,
            'med': median_postgres_style,
            'mod': mode_postgres_style,
            'ecart': stddev_postgres_style,
            'var': lambda data, champ, group_by=None: variance_postgres_style(data, champ, self.variance_sample, group_by),
            'qp': lambda data, champ, group_by=None: percentile_postgres_style(data, champ, self.percentile, group_by),
            'tc': lambda data, champ, group_by=None: growth_rate_postgres_style(data, champ, self.tc_date_key, group_by, self.tc_global_rate),
        }

        func = func_map.get(func_name)

        if func is None:
            return f"{func_name}({champ})"  # fallback string

        if func_name in ['var', 'qp', 'tc']:
            result = func(self.data, champ, self.group_by if len(self.group_by) >= 1 else None)
        else:
            result = func(self.data, champ, self.group_by) if len(self.group_by) >= 1 else func(self.data, champ)
 

        self.group_by = []  
        return result

     
    def binary_op(self, items): 
        left, op, right = items

        def to_number(val):
            try:
                return float(val)
            except:
                return val

        def apply_on_dicts(data, scalar, op, scalar_right=True):
            """Applique l'opération sur la dernière clé (valeur numérique) de chaque dict"""
            result = []
            for row in data:
                new_row = row.copy()
                keys = list(new_row.keys())
                val_key = keys[-1]
                old_val = to_number(new_row[val_key])

                if scalar_right:
                    new_val = apply_op(old_val, op, scalar)
                else:
                    new_val = apply_op(scalar, op, old_val)

                new_row[val_key] = new_val
                result.append(new_row)
            return result

        # === Cas : left est une liste de dicts ===
        if isinstance(left, list) and all(isinstance(row, dict) for row in left):
            if isinstance(right, list):
                raise ValueError("Opération dict-dict non supportée")
            return apply_on_dicts(left, to_number(right), op, scalar_right=True)

        # === Cas : right est une liste de dicts ===
        if isinstance(right, list) and all(isinstance(row, dict) for row in right):
            if isinstance(left, list):
                raise ValueError("Opération dict-dict non supportée")
            return apply_on_dicts(right, to_number(left), op, scalar_right=False)

        # === Cas : autres (scalaires, listes simples, tableaux) ===
        def apply_on_table(table, scalar, op, table_first=True): 
            result = []
            for row in table:
                *prefix, value = row
                value_num = to_number(value)
                if table_first:
                    res = apply_op(value_num, op, scalar)
                else:
                    res = apply_op(scalar, op, value_num)
                result.append((*prefix, res)) 
            return result

        if isinstance(left, list) and all(isinstance(row, (list, tuple)) for row in left): 
            if isinstance(right, list):
                raise ValueError("Opération table-table non supportée ici (ambiguë)")
            right = to_number(right)
            return apply_on_table(left, right, op, table_first=True)

        if isinstance(right, list) and all(isinstance(row, (list, tuple)) for row in right):
            left = to_number(left)
            return apply_on_table(right, left, op, table_first=False)

        if isinstance(left, list):
            left = [to_number(x) for x in left]
        else:
            left = to_number(left)

        if isinstance(right, list):
            right = [to_number(x) for x in right]
        else:
            right = to_number(right)

        if isinstance(left, list) and isinstance(right, list):
            if len(left) != len(right):
                raise ValueError("List lengths do not match")
            return [apply_op(l, op, r) for l, r in zip(left, right)]

        if isinstance(left, list):
            return [apply_op(l, op, right) for l in left]

        if isinstance(right, list):
            return [apply_op(left, op, r) for r in right]

        return apply_op(left, op, right) 
    

    def field(self, items): 
        field_str = f"{items[0]}.{items[1]}"
        values = [row.get(field_str) for row in self.data if row.get(field_str) is not None] 
        return field_str
    

    def parens(self, items): 
        return items[0]

 
    def si_expr(self, items): 
        try:
            condition = items[1]
            then_block = items[3]

            # Si la condition est une liste, on la considère vraie si au moins il y a 1 élément True
            is_true = (
                any(condition) if isinstance(condition, list)
                else bool(condition) if isinstance(condition, (int, float, bool))
                else False  # expression texte non évaluée (ex: "aaa == 2")
            )

            if is_true:
                return then_block if is_true else None  # Exécution normale du bloc "alors"
            
        except Exception as e:
            print("Erreur dans si_expr:", e) 
        # --- Reconstruction en string si la condition échoue ou erreur ---
            si_expr = ""
            expr_parts = []
            j = 1
            for i in items:  
                if j == len(items):
                    si_expr += " ".join(expr_parts) + ") " 
                    expr_parts = []  
                if hasattr(i, "type") and i.type == "SI":
                    si_expr += " ".join(expr_parts) + "si ("
                    expr_parts = [] 
                elif hasattr(i, "type") and i.type == "ALORS":
                    si_expr += " ".join(expr_parts) + ") alors ("
                    expr_parts = [] 
                else:
                    expr_parts.append(str(i))
                j += 1

            si_expr += " ".join(expr_parts) 
            return si_expr


    def sinon_si_expr(self, items):  
        try:
            condition = items[2]
            then_block = items[4]

            # Évaluation de la condition
            is_true = (
                any(condition) if isinstance(condition, list)
                else bool(condition) if isinstance(condition, (int, float, bool))
                else False  # condition texte non calculable
            )

            if is_true:
                return then_block  # On exécute le bloc "alors"
            
        except Exception as e:
            print("Erreur dans sinon_si_expr:", e) 
            # --- Reconstruction textuelle en fallback ---
            sinon_si_expr = "sinon "
            expr_parts = []
            j = 1
            for i in items: 
                if j == len(items):
                    sinon_si_expr += " ".join(expr_parts) + ") "
                    expr_parts = []
                if hasattr(i, "type") and i.type == "SI":
                    sinon_si_expr += "si ("
                    expr_parts = []
                elif hasattr(i, "type") and i.type == "ALORS":
                    sinon_si_expr += " ".join(expr_parts) + ") alors ("
                    expr_parts = []
                else:
                    expr_parts.append(str(i))
                j += 1

            sinon_si_expr += " ".join(expr_parts)
            return sinon_si_expr
    

    def sinon_expr(self, items):  
        try:
            # items = ['sinon', 'alors', expression, group_by?]
            then_block = items[2]
            return then_block  # on retourne directement le résultat s’il n’y a pas d'erreur
        except Exception as e:
            print("Erreur dans sinon_expr:", e) 
            # --- Reconstruction textuelle si erreur ---
            sinon_expr = ""
            expr_parts = []
            j = 1
            for i in items:   
                if j == len(items):
                    sinon_expr += " ".join(expr_parts) + ") "
                    expr_parts = []
                if hasattr(i, "type") and i.type == "ALORS":
                    sinon_expr += " ".join(expr_parts) + " alors ("
                    expr_parts = []
                else:
                    expr_parts.append(str(i))
                j += 1

            sinon_expr += " ".join(expr_parts)
            return sinon_expr

    
    def condition(self, items): 
        def eval_condition(left, op, right):   
            # Cas: extraction des valeurs du data
            if isinstance(left, str) and "." in left:
                left = [row[left] for row in self.data if left in row and row[left] is not None]

            if isinstance(right, str) and "." in right:
                right = [row[right] for row in self.data if right in row and row[right] is not None]

            # 🔹 Cas spécial : comparaison de deux tables groupées (ex: avg vs max)
            if (
                isinstance(left, list) and all(isinstance(row, dict) and len(row) >= 1 for row in left) and
                isinstance(right, list) and all(isinstance(row, dict) and len(row) >= 1 for row in right)
            ):
                # On suppose 1 seule colonne de valeur par dict (clé != group_by)
                left_dict = {tuple(k for k in d.values() if k != list(d.values())[-1]): list(d.values())[-1] for d in left}
                right_dict = {tuple(k for k in d.values() if k != list(d.values())[-1]): list(d.values())[-1] for d in right}
                keys = set(left_dict) & set(right_dict)
                if not keys:
                    raise ValueError("Aucune correspondance entre les groupes pour comparaison")
                return [apply_op(left_dict[k], op, right_dict[k]) for k in keys]

            # 🔹 Cas : left est une table avec colonnes, right est un scalaire
            if isinstance(left, list) and all(isinstance(row, (list, dict)) for row in left):
                if isinstance(right, list):
                    raise ValueError("Comparaison tableau-tableau non supportée")
                right = self._to_number(right)
                left_vals = [self._to_number(list(row.values())[-1]) for row in left]
                return [apply_op(v, op, right) for v in left_vals]

            if isinstance(right, list) and all(isinstance(row, (list, dict)) for row in right):
                left = self._to_number(left)
                right_vals = [self._to_number(list(row.values())[-1]) for row in right]
                return [apply_op(left, op, v) for v in right_vals]

            # 🔹 Cas : listes simples ou scalaires
            if isinstance(left, list):
                left = [self._to_number(x) for x in left]
            else:
                left = self._to_number(left)

            if isinstance(right, list):
                right = [self._to_number(x) for x in right]
            else:
                right = self._to_number(right)

            if isinstance(left, list) and isinstance(right, list):
                if len(left) != len(right):
                    raise ValueError("Longueur de listes incompatibles")
                return [apply_op(l, op, r) for l, r in zip(left, right)]

            if isinstance(left, list):
                return [apply_op(l, op, right) for l in left]

            if isinstance(right, list):
                return [apply_op(left, op, r) for r in right]


            return apply_op(left, op, right)

        # Traitement du premier bloc 
        result = eval_condition(items[0], items[1], items[2])
        i = 3
        while i < len(items):
            log_op = str(items[i])
            next_result = eval_condition(items[i + 1], items[i + 2], items[i + 3])

            try:
                if isinstance(result, list) and isinstance(next_result, list):
                    if len(result) != len(next_result):
                        raise ValueError("Longueur de vecteurs booléens incompatible")
                    result = [r and n if log_op == "ET" else r or n for r, n in zip(result, next_result)]
                elif isinstance(result, list):
                    result = [r and next_result if log_op == "ET" else r or next_result for r in result]
                elif isinstance(next_result, list):
                    result = [result and n if log_op == "ET" else result or n for n in next_result]
                else:
                    result = result and next_result if log_op == "ET" else result or next_result
            except Exception:
                result = f"{result} {log_op} {next_result}"

            i += 4

        return result

        
    def start(self, items):  
        return items[0] if len(items) == 1 else items
    
