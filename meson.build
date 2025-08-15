project(
  'delta-shell',
  version: '0.1',
  default_options: [
    'prefix=/usr',
  ]
)

prefix = get_option('prefix')
bindir = prefix / get_option('bindir')
datadir = prefix / get_option('datadir') / meson.project_name()

ags = find_program('ags', required: true)
find_program('gjs', required: true)

custom_target(
  input: files('app.ts'),
  command: [
    ags,
    'bundle',
    '--define', 'DATADIR="' + datadir + '"',
    '--root', meson.project_source_root(),
    meson.project_source_root() / 'app.ts',
    '@OUTPUT@',
  ],
  output: 'delta-shell-app',
  install: true,
  install_dir: datadir,
  build_always_stale: true,
)

configure_file(
  input: files('run.sh'),
  output: meson.project_name(),
  configuration: {'DATADIR': datadir},
  install: true,
  install_dir: bindir,
  install_mode: 'rwxr-xr-x',
)

install_subdir('assets', install_dir: datadir)
install_subdir('src/styles', install_dir: datadir / 'src')
