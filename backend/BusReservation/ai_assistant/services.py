import json

from django.conf import settings
from google import genai

from .ai_tools import (
    search_available_buses,
    get_available_seats,
    get_user_bookings,
)


# ==========================================================
# GEMINI CLIENT
# ==========================================================

client = genai.Client(
    api_key=settings.GEMINI_API_KEY
)


# ==========================================================
# MODEL
# ==========================================================

MODEL_NAME = "gemini-3.5-flash-lite"


# ==========================================================
# SAFE DICTIONARY
# ==========================================================

def ensure_dict(value):

    if isinstance(value, dict):
        return value

    if isinstance(value, str):

        text = value.strip()

        if text.startswith("```json"):
            text = text[7:]

        elif text.startswith("```"):
            text = text[3:]

        if text.endswith("```"):
            text = text[:-3]

        text = text.strip()

        try:

            result = json.loads(text)

            if isinstance(result, dict):
                return result

            if isinstance(result, str):

                try:
                    result = json.loads(result)

                    if isinstance(result, dict):
                        return result

                except Exception:
                    pass

        except Exception:
            pass

    return {}


# ==========================================================
# EXTRACT USER INTENT
# ==========================================================

def extract_intent(message, context=None):

    if not isinstance(context, dict):
        context = {}

    prompt = f"""
You are the intent detection system for BusGo,
a bus reservation application.

The user is having a continuous conversation.

IMPORTANT:

Do NOT assume any bus name.

Do NOT assume Kochi as source.

Do NOT assume Thrissur as destination.

Do NOT assume any date.

Kochi, Thrissur and 2026-10-20 are NOT actual
user information. They are only examples and
must NEVER be returned unless the user actually
provides them.

Use ONLY information from:

1. The current user message
2. The real previous conversation context

--------------------------------------------------

POSSIBLE INTENTS

search_bus
check_availability
check_seats
fare_information
route_information
schedule_information
my_bookings
booking_help
payment_help
ticket_information
cancellation_help
general

--------------------------------------------------

EXTRACT

intent
bus_name
source
destination
travel_date
schedule_id
from_stop_id
to_stop_id

--------------------------------------------------

SEARCH BUS RULE

For a new bus search, identify:

bus_name
source
destination
travel_date

If any information is missing, return null for
that field.

Do NOT invent missing information.

Example:

User:
"Show buses from Kochi to Thrissur"

Return:

{{
    "intent": "search_bus",
    "bus_name": null,
    "source": "Kochi",
    "destination": "Thrissur",
    "travel_date": null,
    "schedule_id": null,
    "from_stop_id": null,
    "to_stop_id": null
}}

--------------------------------------------------

PREVIOUS CONTEXT

{json.dumps(context, default=str)}

--------------------------------------------------

CURRENT USER MESSAGE

{message}

--------------------------------------------------

RETURN ONLY VALID JSON.

Example structure:

{{
    "intent": "search_bus",
    "bus_name": null,
    "source": null,
    "destination": null,
    "travel_date": null,
    "schedule_id": null,
    "from_stop_id": null,
    "to_stop_id": null
}}
"""

    try:

        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt
        )

        text = getattr(response, "text", "") or ""

        result = ensure_dict(text)

        if result:
            return result

        print("INTENT ERROR: Invalid Gemini JSON")

    except Exception as e:

        print("INTENT ERROR:", str(e))

    return {
        "intent": "general",
        "bus_name": context.get("bus_name"),
        "source": context.get("source"),
        "destination": context.get("destination"),
        "travel_date": context.get("travel_date"),
        "schedule_id": context.get("selected_schedule_id"),
        "from_stop_id": context.get("selected_from_stop_id"),
        "to_stop_id": context.get("selected_to_stop_id"),
    }


# ==========================================================
# FINAL RESPONSE
# ==========================================================

def generate_final_response(
    message,
    intent_data,
    database_data=None,
    context=None
):

    if not isinstance(context, dict):
        context = {}

    prompt = f"""
You are BusGo AI Assistant.

Answer the user using ONLY the database information.

Never invent:

- bus names
- bus numbers
- routes
- source
- destination
- dates
- departure times
- arrival times
- fares
- seats
- bookings

If information is missing, ask the user for it.

If the user is searching for a bus and information
is missing, tell them exactly what information is needed.

For a bus search, the required information is:

1. Bus name
2. Source
3. Destination
4. Travel date

If all information is available and the database
contains a matching bus, show:

- Bus name
- Bus number
- Bus type
- Source
- Destination
- Departure
- Arrival
- Fare
- Travel date

If no matching bus is found, clearly say that
no matching bus was found.

If the user asks about availability after a previous
search, use the previous bus information and show
actual available seats.

Keep responses simple and friendly.

--------------------------------------------------

CURRENT CONTEXT

{json.dumps(context, default=str, indent=2)}

--------------------------------------------------

USER MESSAGE

{message}

--------------------------------------------------

INTENT

{json.dumps(intent_data, default=str, indent=2)}

--------------------------------------------------

DATABASE RESULT

{json.dumps(database_data, default=str, indent=2)}

--------------------------------------------------

ANSWER THE USER.
"""

    try:

        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt
        )

        return (
            getattr(response, "text", None)
            or "I could not generate a response."
        )

    except Exception as e:

        print("FINAL AI ERROR:", str(e))

        return (
            "Sorry, I could not generate the "
            "AI response right now."
        )


# ==========================================================
# MAIN AI FUNCTION
# ==========================================================

def ask_ai(
    message,
    user=None,
    context=None
):

    if not message:

        return {
            "message": "Please enter a message.",
            "context": context or {}
        }

    if not isinstance(context, dict):
        context = {}

    # ======================================================
    # EXTRACT INTENT
    # ======================================================

    intent_data = extract_intent(
        message=message,
        context=context
    )

    if not isinstance(intent_data, dict):
        intent_data = {}

    intent = intent_data.get(
        "intent",
        "general"
    )

    bus_name = intent_data.get(
        "bus_name"
    )

    source = intent_data.get(
        "source"
    )

    destination = intent_data.get(
        "destination"
    )

    travel_date = intent_data.get(
        "travel_date"
    )

    schedule_id = intent_data.get(
        "schedule_id"
    )

    from_stop_id = intent_data.get(
        "from_stop_id"
    )

    to_stop_id = intent_data.get(
        "to_stop_id"
    )

    # ======================================================
    # USE PREVIOUS CONTEXT ONLY WHEN INFORMATION
    # IS ACTUALLY AVAILABLE
    # ======================================================

    if not bus_name:
        bus_name = context.get("bus_name")

    if not source:
        source = context.get("source")

    if not destination:
        destination = context.get("destination")

    if not travel_date:
        travel_date = context.get("travel_date")

    if not schedule_id:
        schedule_id = context.get(
            "selected_schedule_id"
        )

    if not from_stop_id:
        from_stop_id = context.get(
            "selected_from_stop_id"
        )

    if not to_stop_id:
        to_stop_id = context.get(
            "selected_to_stop_id"
        )

    # ======================================================
    # DATABASE DATA
    # ======================================================

    database_data = None

    # ======================================================
    # SEARCH BUS
    # ======================================================

    if intent == "search_bus":

        # -----------------------------------------------
        # BUS NAME REQUIRED
        # -----------------------------------------------

        if not bus_name:

            return {
                "message": (
                    "Sure! Please provide the "
                    "bus name."
                ),
                "context": context
            }

        # -----------------------------------------------
        # SOURCE REQUIRED
        # -----------------------------------------------

        if not source:

            return {
                "message": (
                    f"Got it. Bus name: {bus_name}. "
                    "Please provide the source."
                ),
                "context": {
                    **context,
                    "bus_name": bus_name
                }
            }

        # -----------------------------------------------
        # DESTINATION REQUIRED
        # -----------------------------------------------

        if not destination:

            return {
                "message": (
                    f"Bus: {bus_name}\n"
                    f"Source: {source}\n\n"
                    "Please provide the destination."
                ),
                "context": {
                    **context,
                    "bus_name": bus_name,
                    "source": source
                }
            }

        # -----------------------------------------------
        # DATE REQUIRED
        # -----------------------------------------------

        if not travel_date:

            return {
                "message": (
                    f"Bus: {bus_name}\n"
                    f"Source: {source}\n"
                    f"Destination: {destination}\n\n"
                    "Please provide the travel date."
                ),
                "context": {
                    **context,
                    "bus_name": bus_name,
                    "source": source,
                    "destination": destination
                }
            }

        # -----------------------------------------------
        # SEARCH DATABASE
        # -----------------------------------------------

        database_data = search_available_buses(
            bus_name=bus_name,
            source=source,
            destination=destination,
            travel_date=travel_date
        )

    # ======================================================
    # CHECK AVAILABILITY
    # ======================================================

    elif intent == "check_availability":

        previous_buses = context.get(
            "buses",
            []
        )

        if (
            isinstance(previous_buses, list)
            and previous_buses
        ):

            availability_results = []

            for bus in previous_buses:

                if not isinstance(bus, dict):
                    continue

                bus_schedule_id = bus.get(
                    "schedule_id"
                )

                bus_from_stop_id = bus.get(
                    "source_stop_id"
                )

                bus_to_stop_id = bus.get(
                    "destination_stop_id"
                )

                bus_travel_date = (
                    bus.get("travel_date")
                    or travel_date
                )

                if (
                    bus_schedule_id
                    and bus_from_stop_id
                    and bus_to_stop_id
                    and bus_travel_date
                ):

                    seat_data = get_available_seats(
                        schedule_id=bus_schedule_id,
                        from_stop_id=bus_from_stop_id,
                        to_stop_id=bus_to_stop_id,
                        travel_date=bus_travel_date
                    )

                    availability_results.append({
                        "bus": bus,
                        "availability": seat_data
                    })

            database_data = {
                "success": True,
                "availability": availability_results
            }

        else:

            return {
                "message": (
                    "Please search for a bus first. "
                    "Then I can check its availability."
                ),
                "context": context
            }

    # ======================================================
    # CHECK SEATS
    # ======================================================

    elif intent == "check_seats":

        previous_buses = context.get(
            "buses",
            []
        )

        if (
            isinstance(previous_buses, list)
            and previous_buses
        ):

            seat_results = []

            for bus in previous_buses:

                if not isinstance(bus, dict):
                    continue

                bus_schedule_id = bus.get(
                    "schedule_id"
                )

                bus_from_stop_id = bus.get(
                    "source_stop_id"
                )

                bus_to_stop_id = bus.get(
                    "destination_stop_id"
                )

                bus_travel_date = (
                    bus.get("travel_date")
                    or travel_date
                )

                if (
                    bus_schedule_id
                    and bus_from_stop_id
                    and bus_to_stop_id
                    and bus_travel_date
                ):

                    seat_data = get_available_seats(
                        schedule_id=bus_schedule_id,
                        from_stop_id=bus_from_stop_id,
                        to_stop_id=bus_to_stop_id,
                        travel_date=bus_travel_date
                    )

                    seat_results.append({
                        "bus": bus,
                        "seats": seat_data
                    })

            database_data = {
                "success": True,
                "seat_results": seat_results
            }

        else:

            return {
                "message": (
                    "Please search for a bus first "
                    "so I can check the available seats."
                ),
                "context": context
            }

    # ======================================================
    # MY BOOKINGS
    # ======================================================

    elif intent == "my_bookings":

        if not user:

            return {
                "message": (
                    "Please log in to view your bookings."
                ),
                "context": context
            }

        database_data = get_user_bookings(user)

    # ======================================================
    # FARE INFORMATION
    # ======================================================

    elif intent == "fare_information":

        if source and destination and travel_date:

            database_data = search_available_buses(
                bus_name=bus_name,
                source=source,
                destination=destination,
                travel_date=travel_date
            )

        else:

            return {
                "message": (
                    "Please provide the bus name, "
                    "source, destination and travel date."
                ),
                "context": context
            }

    # ======================================================
    # ROUTE INFORMATION
    # ======================================================

    elif intent == "route_information":

        if source and destination and travel_date:

            database_data = search_available_buses(
                bus_name=bus_name,
                source=source,
                destination=destination,
                travel_date=travel_date
            )

        else:

            return {
                "message": (
                    "Please provide the source, "
                    "destination and travel date."
                ),
                "context": context
            }

    # ======================================================
    # SCHEDULE INFORMATION
    # ======================================================

    elif intent == "schedule_information":

        if source and destination and travel_date:

            database_data = search_available_buses(
                bus_name=bus_name,
                source=source,
                destination=destination,
                travel_date=travel_date
            )

        else:

            return {
                "message": (
                    "Please provide the source, "
                    "destination and travel date."
                ),
                "context": context
            }

    # ======================================================
    # BOOKING HELP
    # ======================================================

    elif intent == "booking_help":

        return {
            "message": (
                "I can help you book a bus ticket. "
                "First, search for a bus by providing "
                "the bus name, source, destination "
                "and travel date."
            ),
            "context": context
        }

    # ======================================================
    # PAYMENT HELP
    # ======================================================

    elif intent == "payment_help":

        return {
            "message": (
                "After selecting a bus and seat, "
                "you can proceed to payment."
            ),
            "context": context
        }

    # ======================================================
    # TICKET INFORMATION
    # ======================================================

    elif intent == "ticket_information":

        return {
            "message": (
                "After successful payment, your ticket "
                "will be generated from your booking."
            ),
            "context": context
        }

    # ======================================================
    # CANCELLATION
    # ======================================================

    elif intent == "cancellation_help":

        return {
            "message": (
                "I can help you with booking cancellation. "
                "Please provide your booking details."
            ),
            "context": context
        }

    # ======================================================
    # UPDATE CONTEXT
    # ======================================================

    new_context = {
        **context
    }

    if bus_name:
        new_context["bus_name"] = bus_name

    if source:
        new_context["source"] = source

    if destination:
        new_context["destination"] = destination

    if travel_date:
        new_context["travel_date"] = travel_date

    if schedule_id:
        new_context["selected_schedule_id"] = schedule_id

    if from_stop_id:
        new_context["selected_from_stop_id"] = from_stop_id

    if to_stop_id:
        new_context["selected_to_stop_id"] = to_stop_id

    # ------------------------------------------------------
    # SAVE SEARCHED BUSES
    # ------------------------------------------------------

    if (
        isinstance(database_data, dict)
        and isinstance(
            database_data.get("buses"),
            list
        )
    ):

        new_context["buses"] = (
            database_data["buses"]
        )

    # ======================================================
    # FINAL RESPONSE
    # ======================================================

    final_response = generate_final_response(
        message=message,
        intent_data=intent_data,
        database_data=database_data,
        context=new_context
    )

    return {
        "message": final_response,
        "context": new_context
    }