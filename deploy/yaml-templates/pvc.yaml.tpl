apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: {{name}}
  namespace: {{namespace}}
spec:
  accessModes:
{{accessModesBlock}}
  resources:
    requests:
      storage: {{storage}}
{{storageClassNameBlock}}