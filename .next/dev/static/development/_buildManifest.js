self.__BUILD_MANIFEST = {
  "__rewrites": {
    "afterFiles": [
      {
        "source": "/api/:path*"
      },
      {
        "source": "/login",
        "destination": "/auth/login"
      },
      {
        "source": "/register",
        "destination": "/auth/signup"
      },
      {
        "source": "/signup",
        "destination": "/auth/signup"
      },
      {
        "source": "/auth/register",
        "destination": "/auth/signup"
      }
    ],
    "beforeFiles": [],
    "fallback": []
  },
  "sortedPages": [
    "/_app",
    "/_error"
  ]
};self.__BUILD_MANIFEST_CB && self.__BUILD_MANIFEST_CB()