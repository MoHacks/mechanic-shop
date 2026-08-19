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
                "enum": ["create_tire", "add_quantity", "set_threshold", "get_threshold", "delete_tire", "create_category", "list_above_threshold", "list_below_threshold", "unknown"],
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
                "description": "Inventory category the item belongs to (e.g. 'tires', 'oils', 'oilfilters'). Required for all actions except create_category and unknown."
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

_system = """You parse natural language commands for a mechanic shop inventory system.
Extract the user's intent and call dispatch_command with the correct fields.

Actions:
- create_tire: user wants to register a new item in a category (e.g. "add michelin to tires", "create oil 5W40")
- add_quantity: user wants to add new or used stock to an existing item (e.g. "add 5 new michelin tires", "put 3 used 5W40 oils in")
- set_threshold: user wants to change the low-stock alert threshold for a category (e.g. "set tires threshold to 50", "change oils threshold to 10")
- delete_tire: user wants to remove an item from a category (e.g. "delete michelin from tires", "remove 5W40 oil")
- create_category: user wants to create a new inventory chart/table (e.g. "create a table for brakes", "add a new chart called wipers")
- get_threshold: user wants to know the current threshold for a category (e.g. "what is the threshold for brakelines", "threshold for oils")
- list_above_threshold: user wants to list items whose total stock exceeds the threshold (e.g. "list all items above the threshold in tires", "what tires are above the threshold")
- list_below_threshold: user wants to list items whose total stock is below the threshold (e.g. "list all items below the threshold in oils", "what oils need restocking")
- unknown: intent cannot be determined

Always infer the category from context (e.g. "tires" for tire brands, "oils" for oil grades, "oilfilters" for oil filters, etc.).
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
