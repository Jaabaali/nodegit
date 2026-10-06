/* PCRE2 configuration for NodeGit's GYP build.
 * Match the bundled libgit2/deps/pcre2/CMakeLists.txt defaults. Optional
 * compiler intrinsics and JIT are left disabled for portability.
 */
#ifndef NODEGIT_PCRE2_CONFIG_H
#define NODEGIT_PCRE2_CONFIG_H

#define HAVE_ASSERT_H 1
#define HAVE_SYS_STAT_H 1
#define HAVE_SYS_TYPES_H 1
#ifdef _WIN32
#define HAVE_WINDOWS_H 1
#else
#define HAVE_DIRENT_H 1
#define HAVE_UNISTD_H 1
#endif

#define SUPPORT_PCRE2_8 1
#define SUPPORT_UNICODE 1
#define LINK_SIZE 2
#define HEAP_LIMIT 20000000
#define MATCH_LIMIT 10000000
#define MATCH_LIMIT_DEPTH MATCH_LIMIT
#define MAX_VARLOOKBEHIND 255
#define NEWLINE_DEFAULT 2
#define PARENS_NEST_LIMIT 250
#define MAX_NAME_SIZE 128
#define MAX_NAME_COUNT 10000

#endif
