import json

def process_json_data(input_json):
    """
    Process the input JSON data and return a JSON with 'text' and 'voice' fields.

    Args:
        input_json (str): A JSON string containing the input data.

    Returns:
        str: A JSON string containing the 'text' and 'voice' fields.
    """
    # Parse the input JSON string
    data = json.loads(input_json)
    
    # Extract the necessary fields (this is just a placeholder, adjust as needed)
    text = data.get('text', '')
    voice = data.get('voice', '')

    # Create the output dictionary
    output_data = {
        'text': text,
        'voice': voice
    }

    # Convert the output dictionary to a JSON string
    output_json = json.dumps(output_data)
    
    return output_json