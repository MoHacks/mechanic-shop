import re

def parse_command(text: str) -> dict:
    """
    Parses a raw WhatsApp message into a structured command dict.

    Supported phrasings:
      - "create tire michelin"
      - "add 5 new to michelin" / "add 5 used to michelin" / "add 5 to michelin"
      - "set threshold tires to 10"
      - "delete tire michelin" / "remove tire michelin"
    """
    text = text.strip().lower()

    # "create tire michelin"
    m = re.match(r"create tire (\w+)", text)
    
    if m:
        return {"action": "create_tire", "name": m.group(1)}

    # "add 5 new to michelin" / "add 5 used to michelin" / "add 5 to michelin"
    m = re.match(r"add (\d+) (new|used)? ?(?:tires? )?to (\w+)", text)

    # TODO: remove this later
    print("m: ", m)
    if m:
        for i in range(len(m.groups()) + 1):
            if m.group(i) is not None:
                print("group: ", i, " : ", m.group(i))
    if m:
        qty = int(m.group(1))
        tire_type = m.group(2) or "new"  # default to "new" if unspecified
        return {
            "action": "add_quantity",
            "name": m.group(3),
            "new": qty if tire_type == "new" else 0,
            "used": qty if tire_type == "used" else 0,
        }

    # "set threshold tires to 10"
    m = re.match(r"set threshold (\w+) to (\d+)", text)
    if m:
        return {
            "action": "set_threshold",
            "category": m.group(1),
            "value": int(m.group(2)),
        }

    # "delete tire michelin" / "remove tire michelin"
    m = re.match(r"(?:delete|remove) tire (\w+)", text)
    if m:
        return {"action": "delete_tire", "name": m.group(1)}

    return {"action": "unknown", "raw_text": text}

