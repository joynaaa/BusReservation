from rest_framework.decorators import (
    api_view,
    permission_classes
)

from rest_framework.permissions import IsAuthenticated

from rest_framework.response import Response

from .services import ask_ai


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def ai_chat(request):

    message = request.data.get(
        "message"
    )

    context = request.data.get(
        "context",
        {}
    )


    if not message:

        return Response(
            {
                "error":
                    "Message is required."
            },
            status=400
        )


    try:

        result = ask_ai(

            message=message,

            user=request.user,

            context=context

        )


        return Response({

            "message":
                result.get(
                    "message",
                    ""
                ),

            "response":
                result.get(
                    "message",
                    ""
                ),

            "context":
                result.get(
                    "context",
                    context
                )

        })


    except Exception as e:

        print(
            "AI CHAT ERROR:",
            str(e)
        )
        import traceback
        traceback.print_exc()
        return Response(

            {
                "error":
                    "AI service error.",

                "details":
                    str(e)
            },

            status=500

        )