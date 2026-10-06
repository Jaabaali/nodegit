#ifndef NODEGIT_H
#define NODEGIT_H

#include <nan.h>

namespace nodegit {
  inline void *ExternalValue(v8::Local<v8::External> external) {
#if defined(V8_EXTERNAL_POINTER_TAG_COUNT)
    return external->Value(v8::kExternalPointerTypeTagDefault);
#else
    return external->Value();
#endif
  }
}

v8::Local<v8::Value> GetPrivate(v8::Local<v8::Object> object,
                                    v8::Local<v8::String> key);

void SetPrivate(v8::Local<v8::Object> object,
                    v8::Local<v8::String> key,
                    v8::Local<v8::Value> value);

#endif
