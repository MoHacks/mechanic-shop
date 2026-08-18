import os
import anthropic
from dotenv import load_dotenv

load_dotenv()

_client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_KEY"))

_tools = [{
    "name": "dispatch_command",
    "description": "Parse a mechanic shop inventory command into a structured action.",
    "input_schema": {
        "type": "object",
        "properties": {
            "action": {
                "type": "string",
                "enum": ["create_tire", "add_quantity", "set_threshold", "delete_tire", "create_category", "unknown"],
                "description": "The type of action the user wants to perform."
            },
            "name": {
                "type": "string",
                "description": "Tire brand name. Required for create_tire, add_quantity, delete_tire."
            },
            "new": {
                "type": "integer",
                "description": "Number of new tires to add. Required for add_quantity."
            },
            "used": {
                "type": "integer",
                "description": "Number of used tires to add. Required for add_quantity."
            },
            "category": {
                "type": "string",
                "description": "Category for the threshold (e.g. 'tires'). Required for set_threshold."
            },
            "value": {
                "type": "integer",
                "description": "The threshold value to set. Required for set_threshold."
            },
            "category_name": {
                "type": "string",
                "description": "Name of the new category/chart to create. Required for create_category."
            },
            "raw_text": {
                "type": "string",
                "description": "Original text, only used when action is unknown."
            }
        },
        "required": ["action"]
    }
}]

_system = """You parse natural language commands for a mechanic shop tire inventory system.
Extract the user's intent and call dispatch_command with the correct fields.

Actions:
- create_tire: user wants to register a new tire brand (e.g. "add michelin", "create tire bridgestone")
- add_quantity: user wants to add new or used tires to an existing brand (e.g. "add 5 new to michelin", "put 3 used goodyear tires in")
- set_threshold: user wants to change the low-stock alert threshold (e.g. "set threshold to 10", "change tire threshold to 150")
- delete_tire: user wants to remove a tire brand (e.g. "delete michelin", "remove bridgestone")
- create_category: user wants to create a new inventory chart/table for a category (e.g. "create a table for brakes", "add a new chart called wipers", "make a spark plugs category")
- unknown: intent cannot be determined

For add_quantity, if the user does not specify new or used, default to new=quantity, used=0."""


def parse_command(text: str) -> dict:
    response = _client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=256,
        system=_system,
        tools=_tools,
        tool_choice={"type": "any"},
        messages=[{"role": "user", "content": text}]
    )
    tool_use = next(b for b in response.content if b.type == "tool_use")
    return tool_use.input
