 

from restitutions.models import Clause_regroupement, Expressions


def update_related_instances(data_list, ModelClass, parent_instance, relation_field='restitution'):
    """
    Met à jour ou crée des instances liées à parent_instance.
    - data_list: liste de dictionnaires contenant les données à mettre à jour/créer
    - ModelClass: classe Django du modèle ciblé
    - parent_instance: instance parente
    - relation_field: nom du champ de relation vers l'instance parente
    """
    for item_data in data_list:
        item_id = item_data.get('id')
        if item_id:
            try:
                instance = ModelClass.objects.get(id=item_id, **{relation_field: parent_instance})
                for attr, value in item_data.items():
                    setattr(instance, attr, value)
                instance.save()
            except ModelClass.DoesNotExist:
                continue
        else:
            ModelClass.objects.create(**{relation_field: parent_instance}, **item_data)


def update_expressions_with_clauses(expression_data_list, condition_instance, m2m_field):
    """
    Met à jour ou crée les objets Expressions et leurs Clause_regroupement associées.
    Supprime les Clause_regroupement absentes du JSON.
    Le champ m2m_field est soit 'champs_cible', soit 'valeur_reference'
    """
    expression_instances = []
    previous_expr = None

    for expr_data in expression_data_list:
        expr_id = expr_data.get("id")
        clause_data_list = expr_data.pop("clause_regroupement", [])

        if expr_id:
            try:
                expr_instance = Expressions.objects.get(id=expr_id)
                for attr, value in expr_data.items():
                    setattr(expr_instance, attr, value)
                expr_instance.id_precedente = previous_expr.id if previous_expr else None
                expr_instance.save()
            except Expressions.DoesNotExist:
                continue
        else:
            expr_instance = Expressions.objects.create(
                **expr_data,
                id_precedente=previous_expr.id if previous_expr else None
            )

        expression_instances.append(expr_instance)
        previous_expr = expr_instance

        # 🔄 Mettre à jour ou créer les Clause_regroupement
        existing_clause_ids = set(expr_instance.clause_regroupement.values_list("id", flat=True))
        incoming_clause_ids = set()

        previous_clause = None
        for clause_data in clause_data_list:
            clause_id = clause_data.get("id")
            if clause_id:
                incoming_clause_ids.add(clause_id)
                try:
                    clause_instance = Clause_regroupement.objects.get(id=clause_id, expression=expr_instance)
                    clause_instance.champs_cible = clause_data.get("champs_cible", clause_instance.champs_cible)
                    clause_instance.id_precedente = previous_clause.id if previous_clause else None
                    clause_instance.save()
                except Clause_regroupement.DoesNotExist:
                    continue
            else:
                clause_instance = Clause_regroupement.objects.create(
                    expression=expr_instance,
                    champs_cible=clause_data.get("champs_cible"),
                    id_precedente=previous_clause.id if previous_clause else None
                )
                incoming_clause_ids.add(clause_instance.id)

            previous_clause = clause_instance

        # 🧹 Supprimer les clauses supprimées dans le JSON
        to_delete_ids = existing_clause_ids - incoming_clause_ids
        Clause_regroupement.objects.filter(id__in=to_delete_ids).delete()

    # 🔁 Associer à la condition (ManyToMany)
    if m2m_field == "champs_cible":
        condition_instance.champs_cible.set(expression_instances)
    elif m2m_field == "valeur_reference":
        condition_instance.valeur_reference.set(expression_instances)


def update_clause_regroupements(clause_data_list, expression_instance):
    """
    Met à jour, crée ou supprime les Clause_regroupement liées à une Expression.
    Gère aussi le chaînage via id_precedente.
    """
    existing_ids = set(expression_instance.clause_regroupement.values_list("id", flat=True))
    incoming_ids = set()

    previous_clause = None
    for clause_data in clause_data_list:
        clause_id = clause_data.get("id")
        if previous_clause:
            clause_data["id_precedente"] = previous_clause.id

        if clause_id:
            incoming_ids.add(clause_id)
            try:
                clause_instance = Clause_regroupement.objects.get(id=clause_id, expression=expression_instance)
                for attr, value in clause_data.items():
                    setattr(clause_instance, attr, value)
                clause_instance.save()
            except Clause_regroupement.DoesNotExist:
                continue
        else:
            clause_instance = Clause_regroupement.objects.create(
                expression=expression_instance,
                champs_cible=clause_data.get("champs_cible"),
                id_precedente=clause_data.get("id_precedente"),
            )
            incoming_ids.add(clause_instance.id)

        previous_clause = clause_instance

    # 🔥 Supprimer les clauses supprimées
    Clause_regroupement.objects.filter(expression=expression_instance, id__in=(existing_ids - incoming_ids)).delete()


def delete_missing_expressions(operation_instance, incoming_expressions):
    """
    Supprime les Expressions (et leurs Clause_regroupement) qui ne sont plus présentes dans le JSON.
    """
    incoming_ids = {expr["id"] for expr in incoming_expressions if expr.get("id")}
    existing_ids = set(operation_instance.expressions.values_list("id", flat=True))

    to_delete_ids = existing_ids - incoming_ids
    if to_delete_ids:
        Expressions.objects.filter(id__in=to_delete_ids).delete()


def delete_missing_condition_expressions(condition_instance, incoming_data_list, m2m_field):
    """
    Supprime les Expressions (et leurs Clause_regroupement) liées à une condition qui ne sont plus dans le JSON.
    """
    incoming_ids = {expr["id"] for expr in incoming_data_list if expr.get("id")}
    current_qs = getattr(condition_instance, m2m_field).all()
    existing_ids = set(current_qs.values_list("id", flat=True))

    to_delete_ids = existing_ids - incoming_ids
    if to_delete_ids:
        getattr(condition_instance, m2m_field).remove(*to_delete_ids)
        Expressions.objects.filter(id__in=to_delete_ids).delete()


def delete_missing_instances_from_json(json_list, ModelClass, parent_instance, relation_field="restitution"):
    """
    Supprime les objets liés à parent_instance (via relation_field) qui ne sont plus dans json_list.
    """
    incoming_ids = {item["id"] for item in json_list if item.get("id")}
    existing_ids = set(ModelClass.objects.filter(**{relation_field: parent_instance}).values_list("id", flat=True))
    to_delete_ids = existing_ids - incoming_ids
    if to_delete_ids:
        ModelClass.objects.filter(id__in=to_delete_ids).delete()

