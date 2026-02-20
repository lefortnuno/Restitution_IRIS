import json
import re

def flatten_expression(expr_list):
    parts = []
    next_is_extra_params = False
    extra_params = [] 

    for item in expr_list: 
        if item["valeur"]:
            if next_is_extra_params :
                extra_params.append(item["valeur"])
            else:
                parts.append(item["valeur"])
        if item["operateur_arithmetique"]:
            if item["operateur_arithmetique"] == ",[":
                next_is_extra_params = True
            elif item["operateur_arithmetique"] in ["]", "]]"]:
                next_is_extra_params = False
            elif item["operateur_arithmetique"] == ",(":
                parts.append(", group_by(")
            else :
                parts.append(item["operateur_arithmetique"])
        if item["clause_regroupement"]: 
            champs_groupBY_part = build_group_by(item.get("clause_regroupement", []))  
            parts.append(champs_groupBY_part)
    res_flatten_exp = {"extra_params":extra_params, "exp_parts": "".join(parts)}
     
    return res_flatten_exp

def flatten_condition_expression(expr_list, api_data, isSubFilter = False):
    parts = []
    req_parts = ""
    cpt = 0
    next_is_extra_params = False
    extra_params = []

    for item in expr_list:   
        if item["valeur"]:
            req_parts = item["valeur"] if isSubFilter and cpt==1 else "" 
            if cpt == 1 and len(item["valeur"].split(".")) == 2:
                table_field = item["valeur"]
                req_parts = table_field
                values = [row.get(table_field, 0) or 0 for row in api_data if table_field in row] 
                parts.append(json.dumps(values)) 
            else: 
                if next_is_extra_params :
                    extra_params.append(item["valeur"])
                else:
                    parts.append(item["valeur"])

        if item["operateur_arithmetique"]:  
            if item["operateur_arithmetique"] in ["+", "-", "*", "/", "%"]:
                cpt = 0
            elif item["operateur_arithmetique"] == ",[":
                next_is_extra_params = True
            elif item["operateur_arithmetique"] in ["]", "]]"]:
                next_is_extra_params = False
            elif item["operateur_arithmetique"] == ",(":
                parts.append(", group_by(")
            else: 
                parts.append(item["operateur_arithmetique"]) 
        if item["clause_regroupement"]: 
            champs_groupBY_part = build_group_by(item.get("clause_regroupement", []))  
            parts.append(champs_groupBY_part)
        cpt += 1 
         
    res = {"extra_cond_params":extra_params, "req_parts": req_parts, "parts": "".join(parts)}    
    return res

def build_conditions(conditions, api_data, requete_sql):
    result = []
    sub_filtre_req = []
    c = conditions[0]["cle_logique"] or ""

    if c == "sinon" or c == "":
        return c
    
    for cond in conditions: 
        left = flatten_condition_expression(cond["champs_cible"], api_data)
        left_part = left["parts"]
        left_req = left["req_parts"]
        left_extra_params = left["extra_cond_params"]

        isSubFilter = False
        if left_req:
            isSubFilter = True

        comp = cond["operateur_comparaison"] or ""
        right = flatten_condition_expression(cond["valeur_reference"], api_data, isSubFilter=isSubFilter)
        right_part = right["parts"]
        right_req = right["req_parts"] 
        right_extra_params = right["extra_cond_params"]

        clause = f"({left_part}){comp}({right_part})"

        clause_req = ""
        if left_req and right_req:
            clause_req = f"{left_req}{comp}{right_req}" 

        if cond["operateur_logique"]:
            clause = f" {cond['operateur_logique']} {clause}"
            clause_req = f" {cond['operateur_logique']} {clause_req}"

        result.append(clause)
        sub_filtre_req.append(clause_req) 

        extra_cond_params = []
        if len(left_extra_params) == 0 and len(right_extra_params) > 0:
            extra_cond_params = right_extra_params
        if len(left_extra_params) > 0: 
            extra_cond_params = left_extra_params

        result_cond = {"extra_cond_params":extra_cond_params, "sub_filtre_req": sub_filtre_req, "res_cond": f"{c}({''.join(result).strip()})"} 
    return result_cond

def build_expression(exprs, champs_groupby=None): 
    res_flatten_exp = flatten_expression(exprs)
    base_expr = res_flatten_exp["exp_parts"]
    extra_params_exp = res_flatten_exp["extra_params"] 

    if not champs_groupby:
        return {"extra_params_exp": extra_params_exp, "exp_build": f"({base_expr})"}

    group_by_str = "group_by(" + ", ".join(champs_groupby) + ")" 

    if "group_by(" in base_expr:
        # Ajout intelligent aux group_by déjà existants
        def merge_group_by(match):
            contenu = match.group(1)
            existants = [x.strip() for x in contenu.split(",") if x.strip()]
            to_add = [ch for ch in champs_groupby if ch not in existants]
            final = existants + to_add
            return "group_by(" + ", ".join(final) + ")"

        base_expr = re.sub(r"group_by\(([^)]*)\)", merge_group_by, base_expr) 
    else:
        # Ajouter group_by à chaque appel de fonction agrégative connue
        functions = ["sum", "avg", "count", "min", "max", "med", "mod", "ecart", "var", "qp", "tc", "show"]
        for func in functions: 
            pattern = rf"({func}\([^()]*?)\)"  # match func(...) sans group_by
            base_expr = re.sub(pattern, rf"\1, {group_by_str})", base_expr)
 
    return {"extra_params_exp": extra_params_exp, "exp_build": f"({base_expr})"}
 
def build_group_by(clauses):
    if not clauses:
        return ""
    fields = ", ".join(c["champs_cible"] for c in clauses)
    return f"{fields}"

def generate_logic_string(data, champs, api_data, requete_sql):
    """
    Retourne une liste de dictionnaires :
    [
      {
        "as_nom": "operation1",
        "operation": "si (...) alors (...)" 
      },
      ...
    ]
    """
    result = []
    params = []

    for op in data: 
        nom_operation = op.get("as_nom", f"operation_{op.get('id')}")

        # Expressions
        expression_build = build_expression(op.get("expressions", []), champs_groupby=champs)
        expression_part = expression_build["exp_build"]
        extra_params_exp = expression_build["extra_params_exp"]

        functions = ["sum", "avg", "count", "min", "max", "med", "mod", "ecart", "var", "qp", "tc", "show"]
        
        # Extraire la première fonction utilisée
        match = re.search(r"\b(" + "|".join(functions) + r")\b\s*\(", expression_part)
        nom_op = match.group(1) if match else "operation"

        if nom_op == "var":
            params.append((
                extra_params_exp[0] if len(extra_params_exp) > 0 else False,
                0,
                '',
                False
            ))

        if nom_op == "qp":
            params.append((
                False,
                extra_params_exp[0] if len(extra_params_exp) > 0 else 0,
                '',
                False
            ))
            
        if nom_op == "tc":
            params.append((
                False,
                0,
                extra_params_exp[0] if len(extra_params_exp) > 0 else '',
                extra_params_exp[1] if len(extra_params_exp) > 1 else False
            ))
           
        if nom_op in ["sum", "avg", "count", "min", "max", "med", "mod", "ecart", "show"]:
            params.append((
                False,
                0,
                '',
                False
            ))
 
        # Conditions (si elles existent)
        conditions = op.get("conditions", [])
        if conditions:
            condition = build_conditions(conditions, api_data, requete_sql) 
            condition_part = condition["res_cond"]
            sub_filtre_req = condition["sub_filtre_req"]
            extra_cond_params = condition["extra_cond_params"]

            if sub_filtre_req:
                filtre_str = "".join(sub_filtre_req)

                if "WHERE" in requete_sql: 
                    before_where, after_where = requete_sql.split("WHERE", 1)
                    requete_sql = f"{before_where}WHERE {filtre_str} AND {after_where}"
                else:
                    requete_sql += f" WHERE {filtre_str}"

            # verifier si expression a utiliser la fonc var, qp, ou tc
            if nom_op not in ["var", "qp", "tc"]: 
                # Extraire la première fonction utilisée
                match = re.search(r"\b(" + "|".join(functions) + r")\b\s*\(", condition_part)
                nom_op = match.group(1) if match else "operation"

                if nom_op == "var": 
                    params[-1] = (
                        extra_cond_params[0] if len(extra_cond_params) > 0 else False,
                        0, 
                        '',
                        False
                    ) 

                if nom_op == "qp": 
                    params[-1] = (
                        False,
                        extra_cond_params[0] if len(extra_cond_params) > 0 else 0, 
                        '',
                        False
                    ) 

                if nom_op == "tc": 
                    params[-1] = (
                        False,
                        0,
                        extra_cond_params[1] if len(extra_cond_params) > 1 else '',
                        extra_cond_params[0] if len(extra_cond_params) > 0 else False
                    ) 
     
            logic_string = f"{condition_part} alors {expression_part}".strip()
        else: 
            logic_string = expression_part   
                
        result.append({
            "nomOP": nom_op,
            "as_nom": nom_operation,
            "operation": logic_string,
            "requete_sql": requete_sql 
        }) 
        
    return {"params":params, "result":result}
